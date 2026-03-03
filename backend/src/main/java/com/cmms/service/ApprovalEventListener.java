package com.cmms.service;

import com.cmms.domain.Inspection;
import com.cmms.domain.WorkOrder;
import com.cmms.domain.WorkPermit;
import com.cmms.event.ApprovalCompletedEvent;
import com.cmms.repository.InspectionRepository;
import com.cmms.repository.WorkOrderRepository;
import com.cmms.repository.WorkPermitRepository;
import com.cmms.domain.InspectionId;
import com.cmms.domain.WorkOrderId;
import com.cmms.domain.WorkPermitId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApprovalEventListener {

    private final InspectionRepository inspectionRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkPermitRepository workPermitRepository;

    @EventListener
    @Transactional
    public void handleApprovalCompletedEvent(ApprovalCompletedEvent event) {
        log.info("Received ApprovalCompletedEvent for Entity: {}, ID: {}, Status: {}",
                event.getRefEntity(), event.getRefId(), event.getFinalStatus());

        String entity = event.getRefEntity().toUpperCase();

        switch (entity) {
            case "INSPECTION":
                inspectionRepository.findById(new InspectionId(event.getCompanyId(), event.getRefId()))
                        .ifPresent(inspection -> {
                            inspection.setStatus(event.getFinalStatus());
                            inspectionRepository.save(inspection);
                        });
                break;
            case "WO":
            case "WORK_ORDER":
                workOrderRepository.findById(new WorkOrderId(event.getCompanyId(), event.getRefId()))
                        .ifPresent(order -> {
                            order.setStatus(event.getFinalStatus());
                            workOrderRepository.save(order);
                        });
                break;
            case "WP":
            case "WORK_PERMIT":
                workPermitRepository.findById(new WorkPermitId(event.getCompanyId(), event.getRefId()))
                        .ifPresent(permit -> {
                            permit.setStatus(event.getFinalStatus());
                            workPermitRepository.save(permit);
                        });
                break;
            default:
                log.warn("Unknown refEntity '{}' found in ApprovalCompletedEvent", entity);
        }
    }
}
