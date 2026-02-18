package com.cmms.controller;

import com.cmms.domain.Approval;
import com.cmms.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approval")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping("/inbox")
    public List<Approval> getInbox(@RequestParam String companyId, @RequestParam String personId) {
        return approvalService.getInbox(companyId, personId);
    }

    @GetMapping("/outbox")
    public List<Approval> getOutbox(@RequestParam String companyId, @RequestParam String personId) {
        return approvalService.getOutbox(companyId, personId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Approval> getApproval(@PathVariable String id, @RequestParam String companyId) {
        return approvalService.getApprovalById(companyId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Approval createApproval(@RequestBody com.cmms.dto.ApprovalRequest request) {
        return approvalService.createApproval(request.getApproval(), request.getSteps());
    }
}
