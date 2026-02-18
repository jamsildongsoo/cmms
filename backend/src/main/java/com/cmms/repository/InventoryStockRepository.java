package com.cmms.repository;

import com.cmms.domain.InventoryStock;
import com.cmms.domain.InventoryStockId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryStockRepository extends JpaRepository<InventoryStock, InventoryStockId> {
}
