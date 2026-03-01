package com.cmms.controller;

import com.cmms.domain.*;
import com.cmms.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tx")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // Inspection
    @PreAuthorize("principal.startsWith(#request.inspection.companyId)")
    @PostMapping("/inspections")
    public Inspection createInspection(@RequestBody com.cmms.dto.InspectionRequest request) {
        return transactionService.saveInspection(request);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/inspections")
    public List<Inspection> getInspections(@RequestParam String companyId) {
        return transactionService.getAllInspections(companyId);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/inspections/{companyId}/{inspectionId}")
    public ResponseEntity<Inspection> getInspection(@PathVariable String companyId, @PathVariable String inspectionId) {
        return transactionService.getInspectionById(companyId, inspectionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @DeleteMapping("/inspections/{companyId}/{inspectionId}")
    public ResponseEntity<Void> deleteInspection(@PathVariable String companyId, @PathVariable String inspectionId) {
        transactionService.deleteInspection(companyId, inspectionId);
        return ResponseEntity.ok().build();
    }

    // WorkOrder
    @PreAuthorize("principal.startsWith(#request.workOrder.companyId)")
    @PostMapping("/work-orders")
    public WorkOrder createWorkOrder(@RequestBody com.cmms.dto.WorkOrderRequest request) {
        return transactionService.saveWorkOrder(request);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/work-orders")
    public List<WorkOrder> getWorkOrders(@RequestParam String companyId) {
        return transactionService.getAllWorkOrders(companyId);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/work-orders/{companyId}/{orderId}")
    public ResponseEntity<WorkOrder> getWorkOrder(@PathVariable String companyId, @PathVariable String orderId) {
        return transactionService.getWorkOrderById(companyId, orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @DeleteMapping("/work-orders/{companyId}/{orderId}")
    public ResponseEntity<Void> deleteWorkOrder(@PathVariable String companyId, @PathVariable String orderId) {
        transactionService.deleteWorkOrder(companyId, orderId);
        return ResponseEntity.ok().build();
    }

    // WorkPermit
    @PreAuthorize("principal.startsWith(#request.workPermit.companyId)")
    @PostMapping("/work-permits")
    public WorkPermit createWorkPermit(@RequestBody com.cmms.dto.WorkPermitRequest request) {
        return transactionService.saveWorkPermit(request);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/work-permits")
    public List<WorkPermit> getWorkPermits(@RequestParam String companyId) {
        return transactionService.getAllWorkPermits(companyId);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/work-permits/{companyId}/{permitId}")
    public ResponseEntity<WorkPermit> getWorkPermit(@PathVariable String companyId, @PathVariable String permitId) {
        return transactionService.getWorkPermitById(companyId, permitId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @DeleteMapping("/work-permits/{companyId}/{permitId}")
    public ResponseEntity<Void> deleteWorkPermit(@PathVariable String companyId, @PathVariable String permitId) {
        transactionService.deleteWorkPermit(companyId, permitId);
        return ResponseEntity.ok().build();
    }
}
