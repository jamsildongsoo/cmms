package com.cmms.service;

import com.cmms.common.domain.CommonStatus;
import com.cmms.domain.*;
import com.cmms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@lombok.extern.slf4j.Slf4j
public class TransactionService {

    private final InspectionRepository inspectionRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkPermitRepository workPermitRepository;
    private final EquipmentRepository equipmentRepository;
    private final PersonRepository personRepository;
    private final DeptRepository deptRepository;
    private final com.cmms.common.security.SecurityUtil securityUtil;
    private final SystemService systemService;

    private record NameMaps(java.util.Map<String, String> equipment, java.util.Map<String, String> person, java.util.Map<String, String> dept) {}

    private NameMaps loadNameMaps(String companyId) {
        var equipMap = equipmentRepository.findAllByCompanyIdAndDeleteMark(companyId, "N").stream()
                .collect(java.util.stream.Collectors.toMap(Equipment::getEquipmentId, Equipment::getName, (a, b) -> a));
        var personMap = personRepository.findAllByCompanyIdAndDeleteMark(companyId, "N").stream()
                .collect(java.util.stream.Collectors.toMap(Person::getPersonId, Person::getName, (a, b) -> a));
        var deptMap = deptRepository.findAllByCompanyIdAndDeleteMark(companyId, "N").stream()
                .collect(java.util.stream.Collectors.toMap(Dept::getDeptId, Dept::getName, (a, b) -> a));
        return new NameMaps(equipMap, personMap, deptMap);
    }

    private void enrichInspection(Inspection i, NameMaps maps) {
        if (i.getEquipmentId() != null) i.setEquipmentName(maps.equipment().getOrDefault(i.getEquipmentId(), null));
        if (i.getPersonId() != null) i.setPersonName(maps.person().getOrDefault(i.getPersonId(), null));
        if (i.getDeptId() != null) i.setDeptName(maps.dept().getOrDefault(i.getDeptId(), null));
    }

    private void enrichWorkOrder(WorkOrder o, NameMaps maps) {
        if (o.getEquipmentId() != null) o.setEquipmentName(maps.equipment().getOrDefault(o.getEquipmentId(), null));
        if (o.getPersonId() != null) o.setPersonName(maps.person().getOrDefault(o.getPersonId(), null));
        if (o.getDeptId() != null) o.setDeptName(maps.dept().getOrDefault(o.getDeptId(), null));
    }

    private void enrichWorkPermit(WorkPermit p, NameMaps maps) {
        if (p.getEquipmentId() != null) p.setEquipmentName(maps.equipment().getOrDefault(p.getEquipmentId(), null));
        if (p.getPersonId() != null) p.setPersonName(maps.person().getOrDefault(p.getPersonId(), null));
        if (p.getDeptId() != null) p.setDeptName(maps.dept().getOrDefault(p.getDeptId(), null));
    }

    // Helper
    private String getMonthKey(java.time.LocalDate date) {
        if (date == null)
            date = java.time.LocalDate.now();
        return date.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMM"));
    }

    // Inspection
    @Transactional
    public Inspection saveInspection(com.cmms.dto.InspectionRequest request) {
        if (request == null || request.getInspection() == null) {
            throw new IllegalArgumentException("점검 데이터가 유효하지 않습니다.");
        }
        Inspection inspection = request.getInspection();
        List<InspectionItem> items = request.getItems();
        securityUtil.validateCompanyId(inspection.getCompanyId());
        log.info("[TransactionService] saveInspection: ID={}, Status={}, Items={}",
                inspection.getInspectionId(), inspection.getStatus(), items != null ? items.size() : 0);

        if (inspection.getInspectionId() == null || inspection.getInspectionId().isBlank()) {
            inspection.setInspectionId(systemService.generateId(inspection.getCompanyId(), "INSPECTION",
                    getMonthKey(java.time.LocalDate.now())));
            if (inspection.getStage() == null)
                inspection.setStage("PLN");
            if (inspection.getStatus() == null)
                inspection.setStatus(CommonStatus.TEMPORARY);

            if (items != null) {
                int lineNo = 1;
                for (InspectionItem item : items) {
                    item.setCompanyId(inspection.getCompanyId());
                    item.setInspectionId(inspection.getInspectionId());
                    if (item.getLineNo() == null)
                        item.setLineNo(lineNo++);
                }
            }
            inspection.setItems(items);
            return inspectionRepository.save(inspection);
        } else {
            // Update mode: Upsert Strategy
            Inspection existing = inspectionRepository
                    .findById(new InspectionId(inspection.getCompanyId(), inspection.getInspectionId()))
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 점검 데이터입니다."));

            if (existing.getStatus() == CommonStatus.CONFIRMED) {
                throw new IllegalStateException("확정된 점검 데이터는 수정할 수 없습니다.");
            }

            // Update header fields
            existing.setName(inspection.getName());
            existing.setPlantId(inspection.getPlantId());
            existing.setEquipmentId(inspection.getEquipmentId());
            existing.setStage(inspection.getStage());
            existing.setCodeItem(inspection.getCodeItem());
            existing.setDeptId(inspection.getDeptId());
            existing.setPersonId(inspection.getPersonId());
            existing.setDate(inspection.getDate());
            existing.setDueDate(inspection.getDueDate());
            existing.setNote(inspection.getNote());
            existing.setFileGroupId(inspection.getFileGroupId());
            existing.setStatus(inspection.getStatus() != null ? inspection.getStatus() : existing.getStatus());

            // Merge items
            java.util.Map<Integer, InspectionItem> existingMap = new java.util.HashMap<>();
            if (existing.getItems() != null) {
                for (InspectionItem entry : existing.getItems()) {
                    existingMap.put(entry.getLineNo(), entry);
                }
            }

            java.util.List<InspectionItem> updatedItems = new java.util.ArrayList<>();
            if (items != null) {
                int nextLineNo = existingMap.keySet().stream().mapToInt(v -> v).max().orElse(0) + 1;
                for (InspectionItem item : items) {
                    Integer lineNo = item.getLineNo();
                    if (lineNo != null && existingMap.containsKey(lineNo)) {
                        // Update existing
                        InspectionItem existingItem = existingMap.get(lineNo);
                        existingItem.setName(item.getName());
                        existingItem.setMethod(item.getMethod());
                        existingItem.setMinVal(item.getMinVal());
                        existingItem.setMaxVal(item.getMaxVal());
                        existingItem.setStdVal(item.getStdVal());
                        existingItem.setUnit(item.getUnit());
                        existingItem.setResultVal(item.getResultVal());
                        updatedItems.add(existingItem);
                        existingMap.remove(lineNo);
                    } else {
                        // New item
                        item.setCompanyId(existing.getCompanyId());
                        item.setInspectionId(existing.getInspectionId());
                        if (item.getLineNo() == null)
                            item.setLineNo(nextLineNo++);
                        updatedItems.add(item);
                    }
                }
            }

            if (existing.getItems() == null) {
                existing.setItems(new java.util.ArrayList<>());
            } else {
                existing.getItems().clear();
            }
            existing.getItems().addAll(updatedItems);

            return inspectionRepository.save(existing);
        }
    }

    public List<Inspection> getAllInspections(String companyId) {
        List<Inspection> list = inspectionRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
        NameMaps maps = loadNameMaps(companyId);
        list.forEach(i -> enrichInspection(i, maps));
        return list;
    }

    public Optional<Inspection> getInspectionById(String companyId, String inspectionId) {
        Optional<Inspection> opt = inspectionRepository.findById(new InspectionId(companyId, inspectionId))
                .filter(inspection -> inspection.getDeleteMark() == null || "N".equals(inspection.getDeleteMark()));
        opt.ifPresent(i -> {
            if (i.getItems() != null)
                i.getItems().size();
            NameMaps maps = loadNameMaps(companyId);
            enrichInspection(i, maps);
        });
        return opt;
    }

    @Transactional
    public boolean deleteInspection(String companyId, String inspectionId) {
        return inspectionRepository.findById(new InspectionId(companyId, inspectionId)).map(inspection -> {
            if (inspection.getStatus() == CommonStatus.CONFIRMED) {
                throw new IllegalStateException("확정된 점검 데이터는 삭제할 수 없습니다.");
            }
            if (inspection.getStatus() == CommonStatus.APPROVAL) {
                throw new IllegalStateException("결재 진행 중인 점검 데이터는 삭제할 수 없습니다.");
            }
            inspection.setDeleteMark("Y");
            inspectionRepository.save(inspection);
            return true;
        }).orElse(false);
    }

    // WorkOrder
    @Transactional
    public WorkOrder saveWorkOrder(com.cmms.dto.WorkOrderRequest request) {
        if (request == null || request.getWorkOrder() == null) {
            throw new IllegalArgumentException("작업 지시 데이터가 유효하지 않습니다.");
        }
        WorkOrder order = request.getWorkOrder();
        List<WorkOrderItem> items = request.getItems();
        securityUtil.validateCompanyId(order.getCompanyId());
        log.info("[TransactionService] saveWorkOrder: ID={}, Status={}, Items={}",
                order.getOrderId(), order.getStatus(), items != null ? items.size() : 0);

        if (order.getOrderId() == null || order.getOrderId().isBlank()) {
            order.setOrderId(
                    systemService.generateId(order.getCompanyId(), "WORK_ORDER",
                            getMonthKey(java.time.LocalDate.now())));
            if (order.getStage() == null)
                order.setStage("PLN");
            if (order.getStatus() == null)
                order.setStatus(CommonStatus.TEMPORARY);

            if (items != null) {
                int lineNo = 1;
                for (WorkOrderItem item : items) {
                    item.setCompanyId(order.getCompanyId());
                    item.setOrderId(order.getOrderId());
                    if (item.getLineNo() == null)
                        item.setLineNo(lineNo++);
                }
            }
            order.setItems(items);
            return workOrderRepository.save(order);
        } else {
            // Update mode: Upsert Strategy
            WorkOrder existing = workOrderRepository.findById(new WorkOrderId(order.getCompanyId(), order.getOrderId()))
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 작업 데이터입니다."));

            if (existing.getStatus() == CommonStatus.CONFIRMED) {
                throw new IllegalStateException("확정된 작업 데이터는 수정할 수 없습니다.");
            }

            // Update header fields
            existing.setPlantId(order.getPlantId());
            existing.setEquipmentId(order.getEquipmentId());
            existing.setName(order.getName());
            existing.setStage(order.getStage());
            existing.setCodeItem(order.getCodeItem());
            existing.setDeptId(order.getDeptId());
            existing.setPersonId(order.getPersonId());
            existing.setDate(order.getDate());
            existing.setNote(order.getNote());
            existing.setCost(order.getCost());
            existing.setTime(order.getTime());
            existing.setFileGroupId(order.getFileGroupId());
            existing.setStatus(order.getStatus() != null ? order.getStatus() : existing.getStatus());

            // Merge items
            java.util.Map<Integer, WorkOrderItem> existingMap = new java.util.HashMap<>();
            if (existing.getItems() != null) {
                for (WorkOrderItem entry : existing.getItems()) {
                    existingMap.put(entry.getLineNo(), entry);
                }
            }

            java.util.List<WorkOrderItem> updatedItems = new java.util.ArrayList<>();
            if (items != null) {
                int nextLineNo = existingMap.keySet().stream().mapToInt(v -> v).max().orElse(0) + 1;
                for (WorkOrderItem item : items) {
                    Integer lineNo = item.getLineNo();
                    if (lineNo != null && existingMap.containsKey(lineNo)) {
                        WorkOrderItem existingItem = existingMap.get(lineNo);
                        existingItem.setName(item.getName());
                        existingItem.setMethod(item.getMethod());
                        existingItem.setResult(item.getResult());
                        updatedItems.add(existingItem);
                        existingMap.remove(lineNo);
                    } else {
                        item.setCompanyId(existing.getCompanyId());
                        item.setOrderId(existing.getOrderId());
                        if (item.getLineNo() == null)
                            item.setLineNo(nextLineNo++);
                        updatedItems.add(item);
                    }
                }
            }

            if (existing.getItems() == null) {
                existing.setItems(new java.util.ArrayList<>());
            } else {
                existing.getItems().clear();
            }
            existing.getItems().addAll(updatedItems);

            return workOrderRepository.save(existing);
        }
    }

    public List<WorkOrder> getAllWorkOrders(String companyId) {
        List<WorkOrder> list = workOrderRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
        NameMaps maps = loadNameMaps(companyId);
        list.forEach(o -> enrichWorkOrder(o, maps));
        return list;
    }

    public Optional<WorkOrder> getWorkOrderById(String companyId, String orderId) {
        Optional<WorkOrder> opt = workOrderRepository.findById(new WorkOrderId(companyId, orderId))
                .filter(order -> order.getDeleteMark() == null || "N".equals(order.getDeleteMark()));
        opt.ifPresent(o -> {
            if (o.getItems() != null)
                o.getItems().size();
            NameMaps maps = loadNameMaps(companyId);
            enrichWorkOrder(o, maps);
        });
        return opt;
    }

    @Transactional
    public boolean deleteWorkOrder(String companyId, String orderId) {
        return workOrderRepository.findById(new WorkOrderId(companyId, orderId)).map(order -> {
            if (order.getStatus() == CommonStatus.CONFIRMED) {
                throw new IllegalStateException("확정된 작업 데이터는 삭제할 수 없습니다.");
            }
            if (order.getStatus() == CommonStatus.APPROVAL) {
                throw new IllegalStateException("결재 진행 중인 작업 데이터는 삭제할 수 없습니다.");
            }
            order.setDeleteMark("Y");
            workOrderRepository.save(order);
            return true;
        }).orElse(false);
    }

    // WorkPermit
    @Transactional
    public WorkPermit saveWorkPermit(com.cmms.dto.WorkPermitRequest request) {
        if (request == null || request.getWorkPermit() == null) {
            throw new IllegalArgumentException("작업 허가 데이터가 유효하지 않습니다.");
        }
        WorkPermit permit = request.getWorkPermit();
        List<WorkPermitItem> items = request.getItems();
        securityUtil.validateCompanyId(permit.getCompanyId());
        log.info("[TransactionService] saveWorkPermit: ID={}, Status={}, Items={}",
                permit.getPermitId(), permit.getStatus(), items != null ? items.size() : 0);

        if (permit.getPermitId() == null || permit.getPermitId().isBlank()) {
            permit.setPermitId(systemService.generateId(permit.getCompanyId(), "WORK_PERMIT",
                    getMonthKey(java.time.LocalDate.now())));
            if (permit.getStage() == null)
                permit.setStage("PLN");
            if (permit.getStatus() == null)
                permit.setStatus(CommonStatus.TEMPORARY);

            if (items != null) {
                int lineNo = 1;
                for (WorkPermitItem item : items) {
                    item.setCompanyId(permit.getCompanyId());
                    item.setPermitId(permit.getPermitId());
                    if (item.getLineNo() == null)
                        item.setLineNo(lineNo++);
                }
            }
            permit.setItems(items);
            return workPermitRepository.save(permit);
        } else {
            // Update mode: Upsert Strategy
            WorkPermit existing = workPermitRepository
                    .findById(new WorkPermitId(permit.getCompanyId(), permit.getPermitId()))
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 작업허가 데이터입니다."));

            if (existing.getStatus() == CommonStatus.CONFIRMED) {
                throw new IllegalStateException("확정된 작업허가 데이터는 수정할 수 없습니다.");
            }

            // Update header fields
            existing.setPlantId(permit.getPlantId());
            existing.setEquipmentId(permit.getEquipmentId());
            existing.setOrderId(permit.getOrderId());
            existing.setName(permit.getName());
            existing.setStage(permit.getStage());
            existing.setWpTypes(permit.getWpTypes());
            existing.setDate(permit.getDate());
            existing.setStartDt(permit.getStartDt());
            existing.setEndDt(permit.getEndDt());
            existing.setLocation(permit.getLocation());
            existing.setDeptId(permit.getDeptId());
            existing.setPersonId(permit.getPersonId());
            existing.setWorkSummary(permit.getWorkSummary());
            existing.setHazardFactor(permit.getHazardFactor());
            existing.setSafetyFactor(permit.getSafetyFactor());
            existing.setChecksheetJsonCom(permit.getChecksheetJsonCom());
            existing.setChecksheetJsonHot(permit.getChecksheetJsonHot());
            existing.setChecksheetJsonConf(permit.getChecksheetJsonConf());
            existing.setChecksheetJsonElec(permit.getChecksheetJsonElec());
            existing.setChecksheetJsonHigh(permit.getChecksheetJsonHigh());
            existing.setChecksheetJsonDig(permit.getChecksheetJsonDig());
            existing.setChecksheetJsonHeavy(permit.getChecksheetJsonHeavy());
            existing.setFileGroupId(permit.getFileGroupId());
            existing.setStatus(permit.getStatus() != null ? permit.getStatus() : existing.getStatus());

            // Merge items
            java.util.Map<Integer, WorkPermitItem> existingMap = new java.util.HashMap<>();
            if (existing.getItems() != null) {
                for (WorkPermitItem entry : existing.getItems()) {
                    existingMap.put(entry.getLineNo(), entry);
                }
            }

            java.util.List<WorkPermitItem> updatedItems = new java.util.ArrayList<>();
            if (items != null) {
                int nextLineNo = existingMap.keySet().stream().mapToInt(v -> v).max().orElse(0) + 1;
                for (WorkPermitItem item : items) {
                    Integer lineNo = item.getLineNo();
                    if (lineNo != null && existingMap.containsKey(lineNo)) {
                        WorkPermitItem existingItem = existingMap.get(lineNo);
                        existingItem.setSignType(item.getSignType());
                        existingItem.setPersonId(item.getPersonId());
                        existingItem.setName(item.getName());
                        existingItem.setSignature(item.getSignature());
                        existingItem.setSignedAt(item.getSignedAt());
                        updatedItems.add(existingItem);
                        existingMap.remove(lineNo);
                    } else {
                        item.setCompanyId(existing.getCompanyId());
                        item.setPermitId(existing.getPermitId());
                        if (item.getLineNo() == null)
                            item.setLineNo(nextLineNo++);
                        updatedItems.add(item);
                    }
                }
            }

            if (existing.getItems() == null) {
                existing.setItems(new java.util.ArrayList<>());
            } else {
                existing.getItems().clear();
            }
            existing.getItems().addAll(updatedItems);

            return workPermitRepository.save(existing);
        }
    }

    public List<WorkPermit> getAllWorkPermits(String companyId) {
        List<WorkPermit> list = workPermitRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
        NameMaps maps = loadNameMaps(companyId);
        list.forEach(p -> enrichWorkPermit(p, maps));
        return list;
    }

    public Optional<WorkPermit> getWorkPermitById(String companyId, String permitId) {
        Optional<WorkPermit> opt = workPermitRepository.findById(new WorkPermitId(companyId, permitId))
                .filter(permit -> permit.getDeleteMark() == null || "N".equals(permit.getDeleteMark()));
        opt.ifPresent(p -> {
            if (p.getItems() != null)
                p.getItems().size();
            NameMaps maps = loadNameMaps(companyId);
            enrichWorkPermit(p, maps);
        });
        return opt;
    }

    @Transactional
    public boolean deleteWorkPermit(String companyId, String permitId) {
        return workPermitRepository.findById(new WorkPermitId(companyId, permitId)).map(permit -> {
            if (permit.getStatus() == CommonStatus.CONFIRMED) {
                throw new IllegalStateException("확정된 작업허가 데이터는 삭제할 수 없습니다.");
            }
            if (permit.getStatus() == CommonStatus.APPROVAL) {
                throw new IllegalStateException("결재 진행 중인 작업허가 데이터는 삭제할 수 없습니다.");
            }
            permit.setDeleteMark("Y");
            workPermitRepository.save(permit);
            return true;
        }).orElse(false);
    }
}
