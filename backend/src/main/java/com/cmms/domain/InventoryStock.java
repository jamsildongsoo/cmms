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
@Table(name = "inventory_stock")
@IdClass(InventoryStockId.class)
public class InventoryStock {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "storage_id", length = 20, nullable = false)
    private String storageId;

    @Id
    @Column(name = "bin_id", length = 20, nullable = false)
    private String binId;

    @Id
    @Column(name = "location_id", length = 20, nullable = false)
    private String locationId;

    @Id
    @Column(name = "inventory_id", length = 20, nullable = false)
    private String inventoryId;

    @Column(name = "qty", precision = 18, scale = 4)
    private BigDecimal qty;

    @Column(name = "amount", precision = 18, scale = 2)
    private BigDecimal amount;

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
