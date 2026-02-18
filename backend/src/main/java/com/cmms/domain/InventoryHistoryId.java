package com.cmms.domain;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class InventoryHistoryId implements Serializable {
    private String companyId;
    private String storageId;
    private String inventoryId;
    private String historyId;
}
