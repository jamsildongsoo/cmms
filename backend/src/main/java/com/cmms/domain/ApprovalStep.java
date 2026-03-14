package com.cmms.domain;

import com.cmms.common.domain.DecisionType;
import com.cmms.common.domain.StepResult;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "approval_step")
@IdClass(ApprovalStepId.class)
public class ApprovalStep {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "approval_id", length = 20, nullable = false)
    private String approvalId;

    @Id
    @Column(name = "line_no", nullable = false)
    private Integer lineNo;

    @Column(name = "person_id", length = 20)
    private String personId;

    @Column(name = "decision", length = 10)
    private DecisionType decision;

    @Column(name = "result", length = 10)
    private StepResult result;

    @Column(name = "decided_at")
    private LocalDateTime decidedAt;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;
}
