package com.cmms.controller;

import com.cmms.domain.Approval;
import com.cmms.domain.ApprovalStep;
import com.cmms.dto.ApprovalRequest;
import com.cmms.dto.DecisionRequest;
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
    public List<Approval> getInbox(
            @RequestParam String companyId,
            @RequestParam String personId,
            @RequestParam(required = false, defaultValue = "pending") String type) {
        return approvalService.getInbox(companyId, personId, type);
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

    @GetMapping("/{id}/steps")
    public List<ApprovalStep> getSteps(@PathVariable String id, @RequestParam String companyId) {
        return approvalService.getApprovalSteps(companyId, id);
    }

    @PostMapping
    public Approval saveApproval(@RequestBody ApprovalRequest request) {
        return approvalService.saveApproval(request.getApproval(), request.getSteps(), request.getStatus());
    }

    @PostMapping("/decision")
    public ResponseEntity<Void> processDecision(@RequestBody DecisionRequest request) {
        approvalService.processDecision(
                request.getCompanyId(),
                request.getApprovalId(),
                request.getPersonId(),
                request.getDecision(),
                request.getComment());
        return ResponseEntity.ok().build();
    }
}
