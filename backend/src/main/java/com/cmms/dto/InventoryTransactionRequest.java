package com.cmms.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class InventoryTransactionRequest {
    private String companyId;
    private String type; // IN, OUT, MOVE, ADJUST
    private String refEntity; // PO, WO, etc.
    private String refId;

    private List<TransactionItem> items;

    @Data
    public static class TransactionItem {
        private String inventoryId;
        // FROM (source)
        private String storageId;
        private String binId;
        private String locationId;
        // TO (destination, MOVE only)
        private String toStorageId;
        private String toLocationId;
        private String toBinId;

        private BigDecimal qty;
        private BigDecimal amount;
    }
}
