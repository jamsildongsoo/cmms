package com.cmms.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "inventory_closing")
@IdClass(InventoryClosingId.class)
public class InventoryClosing {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "storage_id", length = 20, nullable = false)
    private String storageId;

    @Id
    @Column(name = "inventory_id", length = 20, nullable = false)
    private String inventoryId;

    @Id
    @Column(name = "yyyymm", length = 6, nullable = false)
    private String yyyymm;

    @Column(name = "in_qty", precision = 18, scale = 4)
    private BigDecimal inQty;

    @Column(name = "in_amount", precision = 18, scale = 2)
    private BigDecimal inAmount;

    @Column(name = "out_qty", precision = 18, scale = 4)
    private BigDecimal outQty;

    @Column(name = "out_amount", precision = 18, scale = 2)
    private BigDecimal outAmount;

    @Column(name = "move_qty", precision = 18, scale = 4)
    private BigDecimal moveQty;

    @Column(name = "move_amount", precision = 18, scale = 2)
    private BigDecimal moveAmount;

    @Column(name = "adj_qty", precision = 18, scale = 4)
    private BigDecimal adjQty;

    @Column(name = "adj_amount", precision = 18, scale = 2)
    private BigDecimal adjAmount;

    @Column(name = "end_qty", precision = 18, scale = 4)
    private BigDecimal endQty;

    @Column(name = "end_amount", precision = 18, scale = 2)
    private BigDecimal endAmount;

    @Column(name = "status", length = 1)
    private String status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", length = 20)
    private String createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by", length = 20)
    private String updatedBy;
}
