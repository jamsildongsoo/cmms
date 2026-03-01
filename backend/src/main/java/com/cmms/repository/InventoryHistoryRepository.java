package com.cmms.repository;

import com.cmms.domain.InventoryHistory;
import com.cmms.domain.InventoryHistoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, InventoryHistoryId> {
    List<InventoryHistory> findByCompanyId(String companyId);
}
