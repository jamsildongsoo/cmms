package com.cmms.controller;

import com.cmms.common.security.SecurityUtil;
import com.cmms.domain.*;
import com.cmms.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tx")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // Inspection
    @PostMapping("/inspections")
    public Inspection createInspection(@RequestBody com.cmms.dto.InspectionRequest request, Authentication auth) {
        request.getInspection().setCompanyId(SecurityUtil.getCompanyId(auth));
        return transactionService.saveInspection(request);
    }

    @GetMapping("/inspections")
    public List<Inspection> getInspections(Authentication auth) {
        return transactionService.getAllInspections(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/inspections/{inspectionId}")
    public ResponseEntity<Inspection> getInspection(@PathVariable String inspectionId, Authentication auth) {
        return transactionService.getInspectionById(SecurityUtil.getCompanyId(auth), inspectionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/inspections/{inspectionId}")
    public ResponseEntity<Void> deleteInspection(@PathVariable String inspectionId, Authentication auth) {
        boolean deleted = transactionService.deleteInspection(SecurityUtil.getCompanyId(auth), inspectionId);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // WorkOrder
    @PostMapping("/work-orders")
    public WorkOrder createWorkOrder(@RequestBody com.cmms.dto.WorkOrderRequest request, Authentication auth) {
        request.getWorkOrder().setCompanyId(SecurityUtil.getCompanyId(auth));
        return transactionService.saveWorkOrder(request);
    }

    @GetMapping("/work-orders")
    public List<WorkOrder> getWorkOrders(Authentication auth) {
        return transactionService.getAllWorkOrders(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/work-orders/{orderId}")
    public ResponseEntity<WorkOrder> getWorkOrder(@PathVariable String orderId, Authentication auth) {
        return transactionService.getWorkOrderById(SecurityUtil.getCompanyId(auth), orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/work-orders/{orderId}")
    public ResponseEntity<Void> deleteWorkOrder(@PathVariable String orderId, Authentication auth) {
        boolean deleted = transactionService.deleteWorkOrder(SecurityUtil.getCompanyId(auth), orderId);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // WorkPermit
    @PostMapping("/work-permits")
    public WorkPermit createWorkPermit(@RequestBody com.cmms.dto.WorkPermitRequest request, Authentication auth) {
        request.getWorkPermit().setCompanyId(SecurityUtil.getCompanyId(auth));
        return transactionService.saveWorkPermit(request);
    }

    @GetMapping("/work-permits")
    public List<WorkPermit> getWorkPermits(Authentication auth) {
        return transactionService.getAllWorkPermits(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/work-permits/{permitId}")
    public ResponseEntity<WorkPermit> getWorkPermit(@PathVariable String permitId, Authentication auth) {
        return transactionService.getWorkPermitById(SecurityUtil.getCompanyId(auth), permitId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/work-permits/{permitId}")
    public ResponseEntity<Void> deleteWorkPermit(@PathVariable String permitId, Authentication auth) {
        boolean deleted = transactionService.deleteWorkPermit(SecurityUtil.getCompanyId(auth), permitId);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}
