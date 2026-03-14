package com.cmms.controller;

import com.cmms.common.security.SecurityUtil;
import com.cmms.domain.Approval;
import com.cmms.dto.ApprovalRequest;
import com.cmms.dto.DecisionRequest;
import com.cmms.service.ApprovalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approval")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping("/inbox")
    public List<Approval> getInbox(
            @RequestParam(required = false, defaultValue = "pending") String type,
            Authentication auth) {
        return approvalService.getInbox(SecurityUtil.getCompanyId(auth), SecurityUtil.getPersonId(auth), type);
    }

    @GetMapping("/outbox")
    public List<Approval> getOutbox(Authentication auth) {
        return approvalService.getOutbox(SecurityUtil.getCompanyId(auth), SecurityUtil.getPersonId(auth));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Approval> getApproval(@PathVariable String id, Authentication auth) {
        return approvalService.getApprovalById(SecurityUtil.getCompanyId(auth), id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/steps")
    public List<com.cmms.dto.ApprovalStepDetailDto> getSteps(@PathVariable String id, Authentication auth) {
        return approvalService.getApprovalSteps(SecurityUtil.getCompanyId(auth), id);
    }

    @PostMapping
    public Approval saveApproval(@RequestBody ApprovalRequest request, Authentication auth) {
        String companyId = SecurityUtil.getCompanyId(auth);
        String personId = SecurityUtil.getPersonId(auth);
        request.getApproval().setCompanyId(companyId);
        request.getApproval().setRequesterId(personId);
        if (request.getApproval().getCreatedBy() == null) {
            request.getApproval().setCreatedBy(personId);
        }
        return approvalService.saveApproval(request.getApproval(), request.getSteps(), request.getStatus());
    }

    @PostMapping("/decision")
    public ResponseEntity<Void> processDecision(@RequestBody DecisionRequest request, Authentication auth) {
        approvalService.processDecision(
                SecurityUtil.getCompanyId(auth),
                request.getApprovalId(),
                SecurityUtil.getPersonId(auth),
                request.getDecision(),
                request.getComment());
        return ResponseEntity.ok().build();
    }
}
