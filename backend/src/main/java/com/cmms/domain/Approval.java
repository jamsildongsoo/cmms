package com.cmms.domain;

import com.cmms.common.domain.BaseEntity;
import com.cmms.common.domain.CommonStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "approval")
@IdClass(ApprovalId.class)
public class Approval extends BaseEntity {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "approval_id", length = 20, nullable = false)
    private String approvalId;

    @Column(name = "title", length = 100)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "file_group_id", length = 100)
    private String fileGroupId;

    @Column(name = "status", length = 1)
    private CommonStatus status;

    @Column(name = "ref_entity", length = 20)
    private String refEntity;

    @Column(name = "ref_id", length = 20)
    private String refId;

    @Column(name = "requester_id", length = 20)
    private String requesterId;

    @Column(name = "current_step")
    private Integer currentStep;
}
