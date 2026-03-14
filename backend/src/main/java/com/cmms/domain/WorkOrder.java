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
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "work_order")
@IdClass(WorkOrderId.class)
public class WorkOrder extends BaseEntity {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "order_id", length = 20, nullable = false)
    private String orderId;

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

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "cost", precision = 18, scale = 2)
    private BigDecimal cost;

    @Column(name = "time", precision = 10, scale = 2)
    private BigDecimal time;

    @Column(name = "file_group_id", length = 100)
    private String fileGroupId;

    @Column(name = "status", length = 1)
    private CommonStatus status;

    @Column(name = "ref_entity", length = 20)
    private String refEntity;

    @Column(name = "ref_id", length = 20)
    private String refId;

    @Column(name = "approval_id", length = 20)
    private String approvalId;

    @jakarta.persistence.Transient
    private String equipmentName;

    @jakarta.persistence.Transient
    private String personName;

    @jakarta.persistence.Transient
    private String deptName;

    @jakarta.persistence.OneToMany(fetch = jakarta.persistence.FetchType.LAZY, cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @jakarta.persistence.JoinColumns({
            @jakarta.persistence.JoinColumn(name = "company_id", referencedColumnName = "company_id", insertable = false, updatable = false),
            @jakarta.persistence.JoinColumn(name = "order_id", referencedColumnName = "order_id", insertable = false, updatable = false)
    })
    private java.util.List<WorkOrderItem> items;
}
