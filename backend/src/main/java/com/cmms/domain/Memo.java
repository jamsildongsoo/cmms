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
@Table(name = "memo")
@IdClass(MemoId.class)
public class Memo extends BaseEntity {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "memo_id", length = 20, nullable = false)
    private String memoId;

    @Column(name = "title", length = 100)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "file_group_id", length = 100)
    private String fileGroupId;

    @Column(name = "status", length = 1)
    private CommonStatus status;

    @Column(name = "ref_id", length = 20)
    private String refId;

    @Column(name = "approval_id", length = 20)
    private String approvalId;

    @Column(name = "is_notice", length = 1, columnDefinition = "CHAR(1)")
    private String isNotice = "N";
}
