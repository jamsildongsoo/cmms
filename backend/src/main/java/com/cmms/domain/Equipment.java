package com.cmms.domain;

import com.cmms.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "equipment")
@IdClass(EquipmentId.class)
public class Equipment extends BaseEntity {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "equipment_id", length = 20, nullable = false)
    private String equipmentId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "plant_id", length = 20, nullable = false)
    private String plantId;

    @Column(name = "code_item", length = 20)
    private String codeItem;

    @Column(name = "dept_id", length = 20)
    private String deptId;

    @Column(name = "maker_name", length = 100)
    private String makerName;

    @Column(name = "spec", columnDefinition = "TEXT")
    private String spec;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "serial", length = 100)
    private String serial;

    @Column(name = "install_location", length = 100)
    private String installLocation;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "install_date")
    private LocalDate installDate;

    @Column(name = "depre_method", length = 20)
    private String depreMethod;

    @Column(name = "depre_period")
    private Integer deprePeriod;

    @Column(name = "purchase_cost", precision = 18, scale = 2)
    private BigDecimal purchaseCost;

    @Column(name = "residual_value", precision = 18, scale = 2)
    private BigDecimal residualValue;

    @Column(name = "inspection_yn", length = 1, columnDefinition = "CHAR(1) DEFAULT 'Y'")
    private String inspectionYn;

    @Column(name = "psm_yn", length = 1, columnDefinition = "CHAR(1) DEFAULT 'N'")
    private String psmYn;

    @Column(name = "workpermit_yn", length = 1, columnDefinition = "CHAR(1) DEFAULT 'N'")
    private String workpermitYn;

    @Column(name = "inspection_interval")
    private Integer inspectionInterval;

    @Column(name = "inspection_unit", length = 10)
    private String inspectionUnit;

    @Column(name = "last_inspection")
    private LocalDate lastInspection;

    @Column(name = "next_inspection")
    private LocalDate nextInspection;

    @Column(name = "file_group_id", length = 100)
    private String fileGroupId;

    @Column(name = "status", length = 1)
    private String status;

    @Column(name = "use_yn", length = 1, columnDefinition = "CHAR(1) DEFAULT 'Y'")
    private String useYn = "Y";
}
