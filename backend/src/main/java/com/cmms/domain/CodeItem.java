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
@Table(name = "code_item")
@IdClass(CodeItemId.class)
public class CodeItem {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "code_id", length = 20, nullable = false)
    private String codeId;

    @Id
    @Column(name = "item_id", length = 20, nullable = false)
    private String itemId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;
}
