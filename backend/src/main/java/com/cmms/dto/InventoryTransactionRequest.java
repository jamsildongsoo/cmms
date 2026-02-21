package com.cmms.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InventoryTransactionRequest {
    private String companyId;
    private String type; // IN, OUT, MOVE, ADJUST
    private LocalDateTime date;
    private String refEntity; // PO, WO, etc.
    private String refId;
    private String user; // Performer

    private List<TransactionItem> items;

    @Data
    public static class TransactionItem {
        private String inventoryId;
        private String storageId;
        private String binId;
        private String locationId;
        private BigDecimal qty;
        private BigDecimal unitPrice;
    }
}
