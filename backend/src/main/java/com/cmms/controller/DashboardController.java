package com.cmms.controller;

import com.cmms.common.security.SecurityUtil;
import com.cmms.dto.CalendarEventDto;
import com.cmms.dto.DashboardSummaryDto;
import com.cmms.dto.Top5EquipmentDto;
import com.cmms.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary(@RequestParam String month, Authentication auth) {
        return ResponseEntity.ok(dashboardService.getSummary(SecurityUtil.getCompanyId(auth), month));
    }

    @GetMapping("/calendar/inspection")
    public ResponseEntity<List<CalendarEventDto>> getInspectionCalendar(@RequestParam String month, Authentication auth) {
        return ResponseEntity.ok(dashboardService.getInspectionCalendar(SecurityUtil.getCompanyId(auth), month));
    }

    @GetMapping("/calendar/work-order")
    public ResponseEntity<List<CalendarEventDto>> getWorkOrderCalendar(@RequestParam String month, Authentication auth) {
        return ResponseEntity.ok(dashboardService.getWorkOrderCalendar(SecurityUtil.getCompanyId(auth), month));
    }

    @GetMapping("/calendar/work-permit")
    public ResponseEntity<List<CalendarEventDto>> getWorkPermitCalendar(@RequestParam String month, Authentication auth) {
        return ResponseEntity.ok(dashboardService.getWorkPermitCalendar(SecurityUtil.getCompanyId(auth), month));
    }

    @GetMapping("/wo-top5")
    public ResponseEntity<List<Top5EquipmentDto>> getWorkOrderTop5(
            @RequestParam String year,
            @RequestParam(defaultValue = "count") String criteria, Authentication auth) {
        return ResponseEntity.ok(dashboardService.getWorkOrderTop5(SecurityUtil.getCompanyId(auth), year, criteria));
    }

    @GetMapping("/wp-top5")
    public ResponseEntity<List<Top5EquipmentDto>> getWorkPermitTop5(
            @RequestParam String year,
            @RequestParam(defaultValue = "count") String criteria, Authentication auth) {
        return ResponseEntity.ok(dashboardService.getWorkPermitTop5(SecurityUtil.getCompanyId(auth), year, criteria));
    }
}
