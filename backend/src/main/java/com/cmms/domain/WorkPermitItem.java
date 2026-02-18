package com.cmms.domain;

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
@Table(name = "work_permit_item")
@IdClass(WorkPermitItemId.class)
public class WorkPermitItem {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "permit_id", length = 20, nullable = false)
    private String permitId;

    @Id
    @Column(name = "line_no", nullable = false)
    private Integer lineNo;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "signature", columnDefinition = "TEXT")
    private String signature;
}
