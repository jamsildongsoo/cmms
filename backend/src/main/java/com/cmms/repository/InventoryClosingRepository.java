package com.cmms.repository;

import com.cmms.domain.InventoryClosing;
import com.cmms.domain.InventoryClosingId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryClosingRepository extends JpaRepository<InventoryClosing, InventoryClosingId> {
    List<InventoryClosing> findByCompanyId(String companyId);
}
