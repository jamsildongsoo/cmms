package com.cmms.service;

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
public class TransactionService {

    private final InspectionRepository inspectionRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkPermitRepository workPermitRepository;
    private final com.cmms.common.security.SecurityUtil securityUtil;
    private final SystemService systemService;

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

        if (inspection.getInspectionId() == null || inspection.getInspectionId().isBlank()) {
            inspection.setInspectionId(systemService.generateId(inspection.getCompanyId(), "INSPECTION",
                    getMonthKey(java.time.LocalDate.now())));
            if (inspection.getStage() == null)
                inspection.setStage("PLN");
            if (inspection.getStatus() == null)
                inspection.setStatus("T");

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

            if ("C".equals(existing.getStatus())) {
                throw new IllegalStateException("확정된 점검 데이터는 수정할 수 없습니다.");
            }

            // Update header fields
            existing.setName(inspection.getName());
            existing.setPlantId(inspection.getPlantId());
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

            // Re-assign items. JPA orphanRemoval will handle deletions of items removed
            // from the list.
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
        return inspectionRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
    }

    public Optional<Inspection> getInspectionById(String companyId, String inspectionId) {
        Optional<Inspection> opt = inspectionRepository.findById(new InspectionId(companyId, inspectionId))
                .filter(inspection -> inspection.getDeleteMark() == null || "N".equals(inspection.getDeleteMark()));
        opt.ifPresent(i -> {
            if (i.getItems() != null)
                i.getItems().size();
        });
        return opt;
    }

    public List<InspectionItem> getInspectionItems(String companyId, String inspectionId) {
        // Need custom query or simple findAll and filter?
        // With composite key, findAllById is specific.
        // Better: findAll() and filter stream? Or add findByCompanyIdAndInspectionId to
        // repo?
        // Ideally add findByCompanyIdAndInspectionId to Repo.
        return java.util.Collections.emptyList(); // Placeholder, need to update repo first to be efficient
    }

    @Transactional
    public void deleteInspection(String companyId, String inspectionId) {
        inspectionRepository.findById(new InspectionId(companyId, inspectionId)).ifPresent(inspection -> {
            if ("C".equals(inspection.getStatus())) {
                throw new IllegalStateException("확정된 점검 데이터는 삭제할 수 없습니다.");
            }
            inspection.setDeleteMark("Y");
            inspectionRepository.save(inspection);
        });
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

        if (order.getOrderId() == null || order.getOrderId().isBlank()) {
            order.setOrderId(
                    systemService.generateId(order.getCompanyId(), "WORK_ORDER",
                            getMonthKey(java.time.LocalDate.now())));
            if (order.getStage() == null)
                order.setStage("PLN");
            if (order.getStatus() == null)
                order.setStatus("T");

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

            if ("C".equals(existing.getStatus())) {
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
        return workOrderRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
    }

    public Optional<WorkOrder> getWorkOrderById(String companyId, String orderId) {
        Optional<WorkOrder> opt = workOrderRepository.findById(new WorkOrderId(companyId, orderId))
                .filter(order -> order.getDeleteMark() == null || "N".equals(order.getDeleteMark()));
        opt.ifPresent(o -> {
            if (o.getItems() != null)
                o.getItems().size();
        });
        return opt;
    }

    @Transactional
    public void deleteWorkOrder(String companyId, String orderId) {
        workOrderRepository.findById(new WorkOrderId(companyId, orderId)).ifPresent(order -> {
            if ("C".equals(order.getStatus())) {
                throw new IllegalStateException("확정된 작업 데이터는 삭제할 수 없습니다.");
            }
            order.setDeleteMark("Y");
            workOrderRepository.save(order);
        });
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

        if (permit.getPermitId() == null || permit.getPermitId().isBlank()) {
            permit.setPermitId(systemService.generateId(permit.getCompanyId(), "WORK_PERMIT",
                    getMonthKey(java.time.LocalDate.now())));
            if (permit.getStage() == null)
                permit.setStage("PLN");
            if (permit.getStatus() == null)
                permit.setStatus("T");

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

            if ("C".equals(existing.getStatus())) {
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
        return workPermitRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
    }

    public Optional<WorkPermit> getWorkPermitById(String companyId, String permitId) {
        Optional<WorkPermit> opt = workPermitRepository.findById(new WorkPermitId(companyId, permitId))
                .filter(permit -> permit.getDeleteMark() == null || "N".equals(permit.getDeleteMark()));
        opt.ifPresent(p -> {
            if (p.getItems() != null)
                p.getItems().size();
        });
        return opt;
    }

    @Transactional
    public void deleteWorkPermit(String companyId, String permitId) {
        workPermitRepository.findById(new WorkPermitId(companyId, permitId)).ifPresent(permit -> {
            if ("C".equals(permit.getStatus())) {
                throw new IllegalStateException("확정된 작업허가 데이터는 삭제할 수 없습니다.");
            }
            permit.setDeleteMark("Y");
            workPermitRepository.save(permit);
        });
    }
}
