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
@Table(name = "inventory")
@IdClass(InventoryId.class)
public class Inventory extends BaseEntity {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "inventory_id", length = 20, nullable = false)
    private String inventoryId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "code_item", length = 20)
    private String codeItem;

    @Column(name = "dept_id", length = 20)
    private String deptId;

    @Column(name = "unit", length = 20)
    private String unit;

    @Column(name = "maker_name", length = 100)
    private String makerName;

    @Column(name = "spec", columnDefinition = "TEXT")
    private String spec;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "serial", length = 100)
    private String serial;

    @Column(name = "file_group_id", length = 100)
    private String fileGroupId;

    @Column(name = "status", length = 1)
    private String status;
}
