package com.cmms.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class Top5EquipmentDto {
    private String equipmentId;
    private String equipmentName;
    private long totalCount;
    private BigDecimal totalCost;
    private BigDecimal totalTime;
    private String typeCountInfo; // Used for WP Top5 (optional string representation)
}
