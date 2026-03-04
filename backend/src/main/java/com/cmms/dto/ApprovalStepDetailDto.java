package com.cmms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalStepDetailDto {
    private String companyId;
    private String approvalId;
    private Integer lineNo;
    private String personId;
    private String personName;
    private String position;
    private String decision;
    private String result;
    private LocalDateTime decidedAt;
    private String comment;
}
