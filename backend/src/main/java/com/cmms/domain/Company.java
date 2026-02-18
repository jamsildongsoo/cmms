package com.cmms.domain;

import com.cmms.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "company")
public class Company extends BaseEntity {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "bizno", length = 20)
    private String bizno;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;
}
