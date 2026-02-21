package com.cmms.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DecisionRequest {
    private String companyId;
    private String approvalId;
    private String personId;
    private String decision; // APPROVE or REJECT
    private String comment;
}
