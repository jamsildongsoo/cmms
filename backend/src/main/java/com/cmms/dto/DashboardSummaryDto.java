package com.cmms.dto;

import lombok.Data;

@Data
public class DashboardSummaryDto {
    private InspectionSummary inspection;
    private WorkOrderSummary workOrder;
    private WorkPermitSummary workPermit;

    @Data
    public static class InspectionSummary {
        private int completedCount;
    }

    @Data
    public static class WorkOrderSummary {
        private int planCount;
        private int completedCount;
        private int completionRate;
    }

    @Data
    public static class WorkPermitSummary {
        private int totalCount;
        private int approvedCount;
    }
}
