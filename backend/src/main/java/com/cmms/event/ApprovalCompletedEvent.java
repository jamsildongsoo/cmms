package com.cmms.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ApprovalCompletedEvent extends ApplicationEvent {

    private final String companyId;
    private final String refEntity;
    private final String refId;
    private final String finalStatus; // 'C' (Confirmed) or 'R' (Rejected)
    private final String approvalId;

    public ApprovalCompletedEvent(Object source, String companyId, String refEntity, String refId, String finalStatus,
            String approvalId) {
        super(source);
        this.companyId = companyId;
        this.refEntity = refEntity;
        this.refId = refId;
        this.finalStatus = finalStatus;
        this.approvalId = approvalId;
    }
}
