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
    private final InspectionItemRepository inspectionItemRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderItemRepository workOrderItemRepository;
    private final WorkPermitRepository workPermitRepository;
    private final WorkPermitItemRepository workPermitItemRepository;
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
        Inspection inspection = request.getInspection();
        List<InspectionItem> items = request.getItems();

        securityUtil.validateCompanyId(inspection.getCompanyId());

        if (inspection.getInspectionId() == null || inspection.getInspectionId().isBlank()) {
            inspection.setInspectionId(systemService.generateId(inspection.getCompanyId(), "INSPECTION",
                    getMonthKey(inspection.getDate())));

            // For new items, set the generated ID
            if (items != null) {
                for (InspectionItem item : items) {
                    item.setInspectionId(inspection.getInspectionId());
                }
            }
        } else {
            // For update, delete existing items first (simple replacement strategy)
            inspectionItemRepository.deleteByCompanyIdAndInspectionId(inspection.getCompanyId(),
                    inspection.getInspectionId());
        }

        if (inspection.getStage() == null) {
            inspection.setStage("PLN");
        }
        if (inspection.getStatus() == null) {
            inspection.getStatus(); // Default or keep existing? Logic below sets to T if null
            inspection.setStatus("T");
        }

        Inspection saved = inspectionRepository.save(inspection);

        if (items != null && !items.isEmpty()) {
            for (InspectionItem item : items) {
                item.setCompanyId(saved.getCompanyId());
                item.setInspectionId(saved.getInspectionId());
                // lineNo should be sequential or provided by frontend.
                // If provided as null, we generate? Frontend typically manages lineNo or we set
                // loop index + 1
                if (item.getLineNo() == null) {
                    // Logic to find max lineNo? Or re-sequence.
                    // Assuming frontend sends lineNo or we set it here.
                    // Let's rely on frontend sending it or set based on list index + 1
                    // item.setLineNo(items.indexOf(item) + 1); // Careful with concurrent mod if
                    // modifying loop list
                }
            }
            int lineNo = 1;
            for (InspectionItem item : items) {
                if (item.getLineNo() == null)
                    item.setLineNo(lineNo++);
                else
                    lineNo = Math.max(lineNo, item.getLineNo() + 1);
                inspectionItemRepository.save(item);
            }
        }

        return saved;
    }

    public List<Inspection> getAllInspections() {
        return inspectionRepository.findAllByDeleteMarkIsNullOrDeleteMark("N");
    }

    public Optional<Inspection> getInspectionById(String companyId, String inspectionId) {
        return inspectionRepository.findById(new InspectionId(companyId, inspectionId))
                .filter(inspection -> inspection.getDeleteMark() == null || "N".equals(inspection.getDeleteMark()));
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
            inspection.setDeleteMark("Y");
            inspectionRepository.save(inspection);
        });
    }

    // WorkOrder
    @Transactional
    public WorkOrder saveWorkOrder(com.cmms.dto.WorkOrderRequest request) {
        WorkOrder order = request.getWorkOrder();
        List<WorkOrderItem> items = request.getItems();

        securityUtil.validateCompanyId(order.getCompanyId());

        if (order.getOrderId() == null || order.getOrderId().isBlank()) {
            order.setOrderId(
                    systemService.generateId(order.getCompanyId(), "WORK_ORDER", getMonthKey(order.getDate())));
            if (items != null) {
                for (WorkOrderItem item : items) {
                    item.setOrderId(order.getOrderId());
                }
            }
        } else {
            workOrderItemRepository.deleteByCompanyIdAndOrderId(order.getCompanyId(), order.getOrderId());
        }

        if (order.getStage() == null) {
            order.setStage("PLN");
        }
        if (order.getStatus() == null) {
            order.setStatus("T");
        }

        WorkOrder saved = workOrderRepository.save(order);

        if (items != null) {
            int lineNo = 1;
            for (WorkOrderItem item : items) {
                item.setCompanyId(saved.getCompanyId());
                item.setOrderId(saved.getOrderId());
                if (item.getLineNo() == null)
                    item.setLineNo(lineNo++);
                else
                    lineNo = Math.max(lineNo, item.getLineNo() + 1);
                workOrderItemRepository.save(item);
            }
        }
        return saved;
    }

    public List<WorkOrder> getAllWorkOrders() {
        return workOrderRepository.findAllByDeleteMarkIsNullOrDeleteMark("N");
    }

    public Optional<WorkOrder> getWorkOrderById(String companyId, String orderId) {
        return workOrderRepository.findById(new WorkOrderId(companyId, orderId))
                .filter(order -> order.getDeleteMark() == null || "N".equals(order.getDeleteMark()));
    }

    @Transactional
    public void deleteWorkOrder(String companyId, String orderId) {
        workOrderRepository.findById(new WorkOrderId(companyId, orderId)).ifPresent(order -> {
            order.setDeleteMark("Y");
            workOrderRepository.save(order);
        });
    }

    // WorkPermit
    @Transactional
    public WorkPermit saveWorkPermit(com.cmms.dto.WorkPermitRequest request) {
        WorkPermit permit = request.getWorkPermit();
        List<WorkPermitItem> items = request.getItems();

        securityUtil.validateCompanyId(permit.getCompanyId());

        if (permit.getPermitId() == null || permit.getPermitId().isBlank()) {
            // WorkPermit usually has start_dt, use that for date key? or now?
            // Using now for permit ID generation as per previous code
            permit.setPermitId(systemService.generateId(permit.getCompanyId(), "WORK_PERMIT",
                    getMonthKey(java.time.LocalDate.now())));

            if (items != null) {
                for (WorkPermitItem item : items) {
                    item.setPermitId(permit.getPermitId());
                }
            }
        } else {
            workPermitItemRepository.deleteByCompanyIdAndPermitId(permit.getCompanyId(), permit.getPermitId());
        }

        if (permit.getStage() == null) {
            permit.setStage("PLN");
        }
        if (permit.getStatus() == null) {
            permit.setStatus("T");
        }

        WorkPermit saved = workPermitRepository.save(permit);

        if (items != null) {
            int lineNo = 1;
            for (WorkPermitItem item : items) {
                item.setCompanyId(saved.getCompanyId());
                item.setPermitId(saved.getPermitId());
                if (item.getLineNo() == null)
                    item.setLineNo(lineNo++);
                else
                    lineNo = Math.max(lineNo, item.getLineNo() + 1);
                workPermitItemRepository.save(item);
            }
        }
        return saved;
    }

    public List<WorkPermit> getAllWorkPermits() {
        return workPermitRepository.findAllByDeleteMarkIsNullOrDeleteMark("N");
    }

    public Optional<WorkPermit> getWorkPermitById(String companyId, String permitId) {
        return workPermitRepository.findById(new WorkPermitId(companyId, permitId))
                .filter(permit -> permit.getDeleteMark() == null || "N".equals(permit.getDeleteMark()));
    }

    @Transactional
    public void deleteWorkPermit(String companyId, String permitId) {
        workPermitRepository.findById(new WorkPermitId(companyId, permitId)).ifPresent(permit -> {
            permit.setDeleteMark("Y");
            workPermitRepository.save(permit);
        });
    }
}
