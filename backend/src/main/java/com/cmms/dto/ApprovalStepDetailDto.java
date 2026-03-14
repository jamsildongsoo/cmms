package com.cmms.dto;

import com.cmms.common.domain.DecisionType;
import com.cmms.common.domain.StepResult;
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
    private String title;
    private DecisionType decision;
    private StepResult result;
    private LocalDateTime decidedAt;
    private String comment;
}
