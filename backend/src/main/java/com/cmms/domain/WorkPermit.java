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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

    @Column(name = "order_id", length = 20)
    private String orderId;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "stage", length = 20)
    private String stage;

    @Column(name = "wp_types", length = 100)
    @jakarta.persistence.Convert(converter = com.cmms.common.converter.StringListConverter.class)
    private List<String> wpTypes;

    @Column(name = "date")
    private java.time.LocalDate date;

    @Column(name = "start_dt")
    private LocalDateTime startDt;

    @Column(name = "end_dt")
    private LocalDateTime endDt;

    @Column(name = "location", length = 100)
    private String location;

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

    @Column(name = "checksheet_json_com", columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> checksheetJsonCom;

    @Column(name = "checksheet_json_hot", columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> checksheetJsonHot;

    @Column(name = "checksheet_json_conf", columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> checksheetJsonConf;

    @Column(name = "checksheet_json_elec", columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> checksheetJsonElec;

    @Column(name = "checksheet_json_high", columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> checksheetJsonHigh;

    @Column(name = "checksheet_json_dig", columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> checksheetJsonDig;

    @Column(name = "file_group_id", length = 100)
    private String fileGroupId;

    @Column(name = "status", length = 1)
    private String status;

    @Column(name = "parent_permit_id", length = 20)
    private String parentPermitId;

    @Column(name = "approval_id", length = 20)
    private String approvalId;

    @jakarta.persistence.OneToMany(fetch = jakarta.persistence.FetchType.LAZY, cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @jakarta.persistence.JoinColumns({
            @jakarta.persistence.JoinColumn(name = "company_id", referencedColumnName = "company_id", insertable = false, updatable = false),
            @jakarta.persistence.JoinColumn(name = "permit_id", referencedColumnName = "permit_id", insertable = false, updatable = false)
    })
    private List<WorkPermitItem> items;
}
