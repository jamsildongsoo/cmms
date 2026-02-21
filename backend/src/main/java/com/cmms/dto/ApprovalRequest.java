package com.cmms.dto;

import com.cmms.domain.Approval;
import com.cmms.domain.ApprovalStep;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ApprovalRequest {
    private Approval approval;
    private List<ApprovalStep> steps;
    private String status; // T for Temporary, C for Confirm
}
