package com.cmms.dto;

import com.cmms.domain.WorkOrder;
import com.cmms.domain.WorkOrderItem;
import lombok.Data;
import java.util.List;

@Data
public class WorkOrderRequest {
    private WorkOrder workOrder;
    private List<WorkOrderItem> items;
}
