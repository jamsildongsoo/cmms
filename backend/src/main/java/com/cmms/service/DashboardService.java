package com.cmms.service;

import com.cmms.dto.CalendarEventDto;
import com.cmms.dto.DashboardSummaryDto;
import com.cmms.dto.Top5EquipmentDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final EntityManager em;

    public DashboardSummaryDto getSummary(String companyId, String month) {
        DashboardSummaryDto summary = new DashboardSummaryDto();

        // 1. Inspection Summary
        int inspPlan = ((Number) em.createQuery(
                "SELECT COUNT(i) FROM Inspection i WHERE i.companyId = :cid AND i.deleteMark = 'N' AND i.stage = 'PLN' AND to_char(i.date, 'YYYY-MM') = :month")
                .setParameter("cid", companyId)
                .setParameter("month", month)
                .getSingleResult()).intValue();
        int inspAct = ((Number) em.createQuery(
                "SELECT COUNT(i) FROM Inspection i WHERE i.companyId = :cid AND i.deleteMark = 'N' AND i.stage = 'ACT' AND to_char(i.date, 'YYYY-MM') = :month")
                .setParameter("cid", companyId)
                .setParameter("month", month)
                .getSingleResult()).intValue();

        DashboardSummaryDto.InspectionSummary inspSum = new DashboardSummaryDto.InspectionSummary();
        inspSum.setPlanCount(inspPlan);
        inspSum.setCompletedCount(inspAct);
        inspSum.setCompletionRate(inspPlan > 0 ? (int) Math.round((double) inspAct / inspPlan * 100) : 0);
        summary.setInspection(inspSum);

        // 2. Work Order Summary
        int woPlan = ((Number) em.createQuery(
                "SELECT COUNT(w) FROM WorkOrder w WHERE w.companyId = :cid AND w.deleteMark = 'N' AND w.stage = 'PLN' AND to_char(w.date, 'YYYY-MM') = :month")
                .setParameter("cid", companyId)
                .setParameter("month", month)
                .getSingleResult()).intValue();
        int woAct = ((Number) em.createQuery(
                "SELECT COUNT(w) FROM WorkOrder w WHERE w.companyId = :cid AND w.deleteMark = 'N' AND w.stage = 'ACT' AND to_char(w.date, 'YYYY-MM') = :month")
                .setParameter("cid", companyId)
                .setParameter("month", month)
                .getSingleResult()).intValue();

        DashboardSummaryDto.WorkOrderSummary woSum = new DashboardSummaryDto.WorkOrderSummary();
        woSum.setPlanCount(woPlan);
        woSum.setCompletedCount(woAct);
        woSum.setCompletionRate(woPlan > 0 ? (int) Math.round((double) woAct / woPlan * 100) : 0);
        summary.setWorkOrder(woSum);

        // 3. Work Permit Summary
        int wpTotal = ((Number) em.createQuery(
                "SELECT COUNT(w) FROM WorkPermit w WHERE w.companyId = :cid AND w.deleteMark = 'N' AND to_char(w.date, 'YYYY-MM') = :month")
                .setParameter("cid", companyId)
                .setParameter("month", month)
                .getSingleResult()).intValue();
        int wpApproved = ((Number) em.createQuery(
                "SELECT COUNT(w) FROM WorkPermit w WHERE w.companyId = :cid AND w.deleteMark = 'N' AND w.status IN ('C', 'A') AND to_char(w.date, 'YYYY-MM') = :month")
                .setParameter("cid", companyId)
                .setParameter("month", month)
                .getSingleResult()).intValue();

        DashboardSummaryDto.WorkPermitSummary wpSum = new DashboardSummaryDto.WorkPermitSummary();
        wpSum.setTotalCount(wpTotal);
        wpSum.setApprovedCount(wpApproved);
        summary.setWorkPermit(wpSum);

        return summary;
    }

    public List<CalendarEventDto> getInspectionCalendar(String companyId, String month) {
        String jpql = "SELECT i.inspectionId, i.name, CAST(i.date AS string), i.stage FROM Inspection i WHERE i.companyId = :cid AND i.deleteMark = 'N' AND to_char(i.date, 'YYYY-MM') = :month";
        List<Object[]> results = em.createQuery(jpql, Object[].class)
                .setParameter("cid", companyId)
                .setParameter("month", month)
                .getResultList();

        List<CalendarEventDto> events = new ArrayList<>();
        for (Object[] r : results) {
            CalendarEventDto e = new CalendarEventDto();
            e.setId((String) r[0]);
            e.setTitle((String) r[1]);
            e.setStart((String) r[2]);
            e.setEnd((String) r[2]);
            String stage = (String) r[3];
            e.setColor("ACT".equals(stage) ? "#10b981" : "#f59e0b"); // Green for ACT, Yellow for PLN
            e.setStatus(stage);
            e.setType("PM");
            events.add(e);
        }
        return events;
    }

    public List<CalendarEventDto> getWorkOrderCalendar(String companyId, String month) {
        String jpql = "SELECT w.orderId, w.name, CAST(w.date AS string), w.stage FROM WorkOrder w WHERE w.companyId = :cid AND w.deleteMark = 'N' AND to_char(w.date, 'YYYY-MM') = :month";
        List<Object[]> results = em.createQuery(jpql, Object[].class)
                .setParameter("cid", companyId)
                .setParameter("month", month)
                .getResultList();

        List<CalendarEventDto> events = new ArrayList<>();
        for (Object[] r : results) {
            CalendarEventDto e = new CalendarEventDto();
            e.setId((String) r[0]);
            e.setTitle((String) r[1]);
            e.setStart((String) r[2]);
            e.setEnd((String) r[2]);
            String stage = (String) r[3];
            e.setColor("ACT".equals(stage) ? "#3b82f6" : "#94a3b8"); // Blue for ACT, Gray for PLN
            e.setStatus(stage);
            e.setType("WO");
            events.add(e);
        }
        return events;
    }

    public List<CalendarEventDto> getWorkPermitCalendar(String companyId, String month) {
        String queryStr = "SELECT w.permit_id, w.name, w.start_dt, w.end_dt, w.status FROM work_permit w WHERE w.company_id = :cid AND w.delete_mark = 'N' AND to_char(w.start_dt, 'YYYY-MM') = :month";
        Query query = em.createNativeQuery(queryStr);
        query.setParameter("cid", companyId);
        query.setParameter("month", month);

        List<Object[]> results = query.getResultList();

        List<CalendarEventDto> events = new ArrayList<>();
        for (Object[] r : results) {
            CalendarEventDto e = new CalendarEventDto();
            e.setId((String) r[0]);
            e.setTitle((String) r[1]);
            Timestamp start = (Timestamp) r[2];
            Timestamp end = (Timestamp) r[3];
            e.setStart(start != null ? start.toLocalDateTime().toString() : null);
            e.setEnd(end != null ? end.toLocalDateTime().toString() : null);
            String status = (String) r[4];
            e.setColor("C".equals(status) ? "#ef4444" : "#f97316"); // Red or Orange
            e.setStatus(status);
            e.setType("WP");
            events.add(e);
        }
        return events;
    }

    public List<Top5EquipmentDto> getWorkOrderTop5(String companyId, String year, String criteria) {
        String orderBySql = "ORDER BY total_count DESC";
        if ("cost".equals(criteria))
            orderBySql = "ORDER BY total_cost DESC";
        else if ("time".equals(criteria))
            orderBySql = "ORDER BY total_time DESC";

        String queryStr = "SELECT e.equipment_id, e.name as equipment_name, " +
                "COUNT(w.order_id) as total_count, " +
                "SUM(COALESCE(w.cost, 0)) as total_cost, " +
                "SUM(COALESCE(w.time, 0)) as total_time " +
                "FROM work_order w " +
                "JOIN equipment e ON w.company_id = e.company_id AND w.equipment_id = e.equipment_id " +
                "WHERE w.company_id = :cid AND w.delete_mark = 'N' AND w.stage = 'ACT' " +
                "AND to_char(w.date, 'YYYY') = :year " +
                "GROUP BY e.equipment_id, e.name " +
                orderBySql + " LIMIT 5";

        List<Object[]> results = em.createNativeQuery(queryStr)
                .setParameter("cid", companyId)
                .setParameter("year", year)
                .getResultList();

        List<Top5EquipmentDto> list = new ArrayList<>();
        for (Object[] row : results) {
            Top5EquipmentDto dto = new Top5EquipmentDto();
            dto.setEquipmentId((String) row[0]);
            dto.setEquipmentName((String) row[1]);
            dto.setTotalCount(((Number) row[2]).longValue());
            dto.setTotalCost(row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO);
            dto.setTotalTime(row[4] != null ? new BigDecimal(row[4].toString()) : BigDecimal.ZERO);
            list.add(dto);
        }
        return list;
    }

    public List<Top5EquipmentDto> getWorkPermitTop5(String companyId, String year, String criteria) {
        // default by count
        String queryStr = "SELECT e.equipment_id, e.name as equipment_name, " +
                "COUNT(w.permit_id) as total_count " +
                "FROM work_permit w " +
                "JOIN equipment e ON w.company_id = e.company_id AND w.equipment_id = e.equipment_id " +
                "WHERE w.company_id = :cid AND w.delete_mark = 'N' " +
                "AND to_char(w.date, 'YYYY') = :year " +
                "GROUP BY e.equipment_id, e.name " +
                "ORDER BY total_count DESC LIMIT 5";

        List<Object[]> results = em.createNativeQuery(queryStr)
                .setParameter("cid", companyId)
                .setParameter("year", year)
                .getResultList();

        List<Top5EquipmentDto> list = new ArrayList<>();
        for (Object[] row : results) {
            Top5EquipmentDto dto = new Top5EquipmentDto();
            dto.setEquipmentId((String) row[0]);
            dto.setEquipmentName((String) row[1]);
            dto.setTotalCount(((Number) row[2]).longValue());
            list.add(dto);
        }
        return list;
    }
}
