package com.cmms.repository;

import com.cmms.domain.WorkOrder;
import com.cmms.domain.WorkOrderId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, WorkOrderId> {
    @EntityGraph(attributePaths = { "items" })
    List<WorkOrder> findAllByCompanyIdAndDeleteMark(String companyId, String deleteMark);
}
