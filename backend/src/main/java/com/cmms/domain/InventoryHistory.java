package com.cmms.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "inventory_history")
@IdClass(InventoryHistoryId.class)
@EntityListeners(AuditingEntityListener.class)
public class InventoryHistory {

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

    @Id
    @Column(name = "history_id", length = 20, nullable = false)
    private String historyId;

    @Column(name = "tx_type", length = 20)
    private String txType;

    @Column(name = "qty", precision = 18, scale = 4)
    private BigDecimal qty;

    @Column(name = "amount", precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "ref_entity", length = 20)
    private String refEntity;

    @Column(name = "ref_id", length = 20)
    private String refId;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @CreatedBy
    @Column(name = "created_by", length = 50, updatable = false)
    private String createdBy;
}
