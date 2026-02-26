package com.cmms.controller;

import com.cmms.domain.*;
import com.cmms.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tx")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // Inspection
    @PostMapping("/inspections")
    public Inspection createInspection(@RequestBody com.cmms.dto.InspectionRequest request) {
        return transactionService.saveInspection(request);
    }

    @GetMapping("/inspections")
    public List<Inspection> getInspections(@RequestParam String companyId) {
        return transactionService.getAllInspections(companyId);
    }

    @GetMapping("/inspections/{companyId}/{inspectionId}")
    public ResponseEntity<Inspection> getInspection(@PathVariable String companyId, @PathVariable String inspectionId) {
        return transactionService.getInspectionById(companyId, inspectionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/inspections/{companyId}/{inspectionId}")
    public ResponseEntity<Void> deleteInspection(@PathVariable String companyId, @PathVariable String inspectionId) {
        transactionService.deleteInspection(companyId, inspectionId);
        return ResponseEntity.ok().build();
    }

    // WorkOrder
    @PostMapping("/work-orders")
    public WorkOrder createWorkOrder(@RequestBody com.cmms.dto.WorkOrderRequest request) {
        return transactionService.saveWorkOrder(request);
    }

    @GetMapping("/work-orders")
    public List<WorkOrder> getWorkOrders(@RequestParam String companyId) {
        return transactionService.getAllWorkOrders(companyId);
    }

    @GetMapping("/work-orders/{companyId}/{orderId}")
    public ResponseEntity<WorkOrder> getWorkOrder(@PathVariable String companyId, @PathVariable String orderId) {
        return transactionService.getWorkOrderById(companyId, orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/work-orders/{companyId}/{orderId}")
    public ResponseEntity<Void> deleteWorkOrder(@PathVariable String companyId, @PathVariable String orderId) {
        transactionService.deleteWorkOrder(companyId, orderId);
        return ResponseEntity.ok().build();
    }

    // WorkPermit
    @PostMapping("/work-permits")
    public WorkPermit createWorkPermit(@RequestBody com.cmms.dto.WorkPermitRequest request) {
        return transactionService.saveWorkPermit(request);
    }

    @GetMapping("/work-permits")
    public List<WorkPermit> getWorkPermits(@RequestParam String companyId) {
        return transactionService.getAllWorkPermits(companyId);
    }

    @GetMapping("/work-permits/{companyId}/{permitId}")
    public ResponseEntity<WorkPermit> getWorkPermit(@PathVariable String companyId, @PathVariable String permitId) {
        return transactionService.getWorkPermitById(companyId, permitId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/work-permits/{companyId}/{permitId}")
    public ResponseEntity<Void> deleteWorkPermit(@PathVariable String companyId, @PathVariable String permitId) {
        transactionService.deleteWorkPermit(companyId, permitId);
        return ResponseEntity.ok().build();
    }
}
