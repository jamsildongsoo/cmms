package com.cmms.service;

import com.cmms.event.ApprovalCompletedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ApprovalEventListener {

    @EventListener
    public void handleApprovalCompletedEvent(ApprovalCompletedEvent event) {
        // 상태 변경은 ApprovalService.updateRefEntityStatus()에서 직접 처리
        // 이벤트는 향후 알림/로깅 등 확장 용도로 유지
        log.info("ApprovalCompleted: entity={}, id={}, status={}, approvalId={}",
                event.getRefEntity(), event.getRefId(), event.getFinalStatus(), event.getApprovalId());
    }
}
