package com.cmms.domain;

import com.cmms.common.domain.BaseEntity;
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
@Table(name = "code")
@IdClass(CodeId.class)
public class Code extends BaseEntity {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "code_id", length = 20, nullable = false)
    private String codeId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;
}
