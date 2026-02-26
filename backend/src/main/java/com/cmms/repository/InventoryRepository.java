package com.cmms.repository;

import com.cmms.domain.Inventory;
import com.cmms.domain.InventoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, InventoryId> {
    List<Inventory> findAllByCompanyIdAndDeleteMark(String companyId, String deleteMark);
}
