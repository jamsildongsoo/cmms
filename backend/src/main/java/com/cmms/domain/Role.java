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
@Table(name = "role")
@IdClass(RoleId.class)
public class Role {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "role_id", length = 20, nullable = false)
    private String roleId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "delete_mark", length = 1, columnDefinition = "CHAR(1)")
    private String deleteMark = "N";
}
