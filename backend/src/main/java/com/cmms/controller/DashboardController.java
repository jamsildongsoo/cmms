package com.cmms.controller;

import com.cmms.dto.CalendarEventDto;
import com.cmms.dto.DashboardSummaryDto;
import com.cmms.dto.Top5EquipmentDto;
import com.cmms.common.security.SecurityUtil;
import com.cmms.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary(@RequestParam String companyId, @RequestParam String month) {
        DashboardSummaryDto summary = dashboardService.getSummary(companyId, month);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/calendar/inspection")
    public ResponseEntity<List<CalendarEventDto>> getInspectionCalendar(@RequestParam String companyId,
            @RequestParam String month) {
        return ResponseEntity.ok(dashboardService.getInspectionCalendar(companyId, month));
    }

    @GetMapping("/calendar/work-order")
    public ResponseEntity<List<CalendarEventDto>> getWorkOrderCalendar(@RequestParam String companyId,
            @RequestParam String month) {
        return ResponseEntity.ok(dashboardService.getWorkOrderCalendar(companyId, month));
    }

    @GetMapping("/calendar/work-permit")
    public ResponseEntity<List<CalendarEventDto>> getWorkPermitCalendar(@RequestParam String companyId,
            @RequestParam String month) {
        return ResponseEntity.ok(dashboardService.getWorkPermitCalendar(companyId, month));
    }

    @GetMapping("/wo-top5")
    public ResponseEntity<List<Top5EquipmentDto>> getWorkOrderTop5(
            @RequestParam String companyId,
            @RequestParam String year,
            @RequestParam(defaultValue = "count") String criteria) {
        return ResponseEntity.ok(dashboardService.getWorkOrderTop5(companyId, year, criteria));
    }

    @GetMapping("/wp-top5")
    public ResponseEntity<List<Top5EquipmentDto>> getWorkPermitTop5(
            @RequestParam String companyId,
            @RequestParam String year,
            @RequestParam(defaultValue = "count") String criteria) {
        return ResponseEntity.ok(dashboardService.getWorkPermitTop5(companyId, year, criteria));
    }
}
