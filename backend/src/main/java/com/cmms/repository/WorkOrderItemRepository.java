package com.cmms.repository;

import com.cmms.domain.WorkOrderItem;
import com.cmms.domain.WorkOrderItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkOrderItemRepository extends JpaRepository<WorkOrderItem, WorkOrderItemId> {
    void deleteByCompanyIdAndOrderId(String companyId, String orderId);
}
