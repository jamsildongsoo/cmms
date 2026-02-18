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
@Table(name = "work_order_item")
@IdClass(WorkOrderItemId.class)
public class WorkOrderItem {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "order_id", length = 20, nullable = false)
    private String orderId;

    @Id
    @Column(name = "line_no", nullable = false)
    private Integer lineNo;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "method", length = 100)
    private String method;

    @Column(name = "result", columnDefinition = "TEXT")
    private String result;
}
