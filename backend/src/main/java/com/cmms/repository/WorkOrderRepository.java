package com.cmms.repository;

import com.cmms.domain.WorkOrder;
import com.cmms.domain.WorkOrderId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, WorkOrderId> {
    List<WorkOrder> findAllByDeleteMarkIsNullOrDeleteMark(String deleteMark);
}
