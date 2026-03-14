package com.cmms.repository;

import com.cmms.domain.InventoryStock;
import com.cmms.domain.InventoryStockId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface InventoryStockRepository extends JpaRepository<InventoryStock, InventoryStockId> {
    List<InventoryStock> findByCompanyIdOrderByInventoryIdAscStorageIdAsc(String companyId);

    @Query("SELECT CASE WHEN SUM(s.qty) > 0 THEN SUM(s.amount) / SUM(s.qty) ELSE 0 END " +
           "FROM InventoryStock s " +
           "WHERE s.companyId = :companyId AND s.storageId = :storageId AND s.inventoryId = :inventoryId")
    BigDecimal getStorageUnitPrice(@Param("companyId") String companyId,
                                  @Param("storageId") String storageId,
                                  @Param("inventoryId") String inventoryId);
}
