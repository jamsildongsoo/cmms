package com.cmms.repository;

import com.cmms.domain.InventoryHistory;
import com.cmms.domain.InventoryHistoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, InventoryHistoryId> {
}
