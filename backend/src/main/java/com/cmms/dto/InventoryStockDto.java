package com.cmms.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class InventoryStockDto {
    private String inventoryId;
    private String name;
    private String spec;
    private String unit;
    private String codeItem;
    private String storageId;
    private String storageName;
    private String binId;
    private String binName;
    private String locationId;
    private String locationName;
    private BigDecimal qty;
    private BigDecimal amount;
}
