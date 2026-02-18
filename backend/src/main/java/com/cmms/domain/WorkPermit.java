package com.cmms.domain;

import com.cmms.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Entity
@Table(name = "work_permit")
@IdClass(WorkPermitId.class)
public class WorkPermit extends BaseEntity {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "permit_id", length = 20, nullable = false)
    private String permitId;

    @Column(name = "plant_id", length = 20)
    private String plantId;

    @Column(name = "equipment_id", length = 20)
    private String equipmentId;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "stage", length = 20)
    private String stage;

    @Column(name = "code_item", length = 20)
    private String codeItem;

    @Column(name = "dept_id", length = 20)
    private String deptId;

    @Column(name = "person_id", length = 20)
    private String personId;

    @Column(name = "work_summary", columnDefinition = "TEXT")
    private String workSummary;

    @Column(name = "hazard_factor", columnDefinition = "TEXT")
    private String hazardFactor;

    @Column(name = "safety_factor", columnDefinition = "TEXT")
    private String safetyFactor;

    @Column(name = "checksheet_json", columnDefinition = "JSONB")
    @JdbcTypeCode(SqlTypes.JSON)
    private String checksheetJson;

    @Column(name = "file_group_id", length = 100)
    private String fileGroupId;

    @Column(name = "status", length = 1)
    private String status;

    @Column(name = "ref_id", length = 20)
    private String refId;

    @Column(name = "approval_id", length = 20)
    private String approvalId;

    @Column(name = "wp_types", length = 100)
    @jakarta.persistence.Convert(converter = com.cmms.common.converter.StringListConverter.class)
    private java.util.List<String> wpTypes;

    @jakarta.persistence.Transient
    private java.util.List<WorkPermitItem> items;
}
