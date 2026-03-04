package com.cmms.service;

import com.cmms.domain.Approval;
import com.cmms.domain.ApprovalId;
import com.cmms.domain.ApprovalStep;
import com.cmms.repository.ApprovalRepository;
import com.cmms.repository.ApprovalStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final ApprovalStepRepository approvalStepRepository;
    private final SystemService systemService;
    private final ApprovalHtmlService approvalHtmlService;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Transactional
    public Approval saveApproval(Approval approval, List<ApprovalStep> steps, String targetStatus) {
        // targetStatus: T (Temporary), A (Approving/Submitted)

        // Generate HTML Body if upper entity is provided and status is moving to A
        if ("A".equals(targetStatus) && approval.getRefEntity() != null && approval.getRefId() != null) {
            String generatedHtml = approvalHtmlService.generateHtmlBody(approval.getCompanyId(),
                    approval.getRefEntity(), approval.getRefId());
            approval.setContent(generatedHtml);
        }
        if (approval.getApprovalId() == null || approval.getApprovalId().isBlank()) {
            approval.setApprovalId(systemService.generateId(approval.getCompanyId(), "APPROVAL",
                    java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMM"))));
            approval.setStatus(targetStatus);
            if ("A".equals(targetStatus)) {
                approval.setCurrentStep(1);
            }
        } else {
            approvalRepository.findById(new ApprovalId(approval.getCompanyId(), approval.getApprovalId()))
                    .ifPresent(existing -> {
                        if (!"T".equals(existing.getStatus())) {
                            throw new IllegalStateException("임시 저장 상태가 아닌 결재 문서는 수정할 수 없습니다.");
                        }
                    });
            approval.setStatus(targetStatus);
            if ("A".equals(targetStatus)) {
                approval.setCurrentStep(1);
            }
            List<ApprovalStep> existingSteps = approvalStepRepository
                    .findAllByCompanyIdAndApprovalIdOrderByLineNoAsc(approval.getCompanyId(), approval.getApprovalId());
            approvalStepRepository.deleteAll(existingSteps);
        }

        Approval saved = approvalRepository.save(approval);
        if (steps != null) {
            for (ApprovalStep step : steps) {
                step.setApprovalId(saved.getApprovalId());
                step.setCompanyId(saved.getCompanyId());
                approvalStepRepository.save(step);
            }
        }
        return saved;
    }

    @Transactional
    public void processDecision(String companyId, String approvalId, String personId, String decision, String comment) {
        Approval approval = approvalRepository.findById(new ApprovalId(companyId, approvalId))
                .orElseThrow(() -> new IllegalArgumentException("Approval not found"));

        if (!"A".equals(approval.getStatus())) {
            throw new IllegalStateException("상신된 문서가 아니거나 이미 결재가 종료되었습니다.");
        }

        List<ApprovalStep> steps = approvalStepRepository.findAllByCompanyIdAndApprovalIdOrderByLineNoAsc(companyId,
                approvalId);
        ApprovalStep currentStep = steps.stream()
                .filter(s -> s.getLineNo().equals(approval.getCurrentStep()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Current step not found"));

        if (!currentStep.getPersonId().equals(personId)) {
            throw new IllegalStateException("현재 결재 순서가 아닙니다.");
        }

        // currentStep.setDecision(decision); // DO NOT OVERWRITE THE TYPE
        currentStep.setComment(comment);
        currentStep.setDecidedAt(java.time.LocalDateTime.now());

        if ("REJECT".equals(decision)) {
            currentStep.setResult("N"); // Rejected
            approval.setStatus("R"); // Rejected
            if (approval.getRefEntity() != null && approval.getRefId() != null) {
                eventPublisher.publishEvent(new com.cmms.event.ApprovalCompletedEvent(
                        this, companyId, approval.getRefEntity(), approval.getRefId(), "R", approvalId));
            }
        } else {
            currentStep.setResult("Y"); // Approved
            if (approval.getCurrentStep() < steps.size()) {
                approval.setCurrentStep(approval.getCurrentStep() + 1);
            } else {
                approval.setStatus("C"); // Confirmed/Finished
                if (approval.getRefEntity() != null && approval.getRefId() != null) {
                    eventPublisher.publishEvent(new com.cmms.event.ApprovalCompletedEvent(
                            this, companyId, approval.getRefEntity(), approval.getRefId(), "C", approvalId));
                }
            }
        }

        approvalStepRepository.save(currentStep);
        approvalRepository.save(approval);
    }

    public List<Approval> getInbox(String companyId, String personId, String type) {
        if ("completed".equalsIgnoreCase(type)) {
            return approvalRepository.findCompletedInbox(companyId, personId);
        } else if ("reference".equalsIgnoreCase(type)) {
            return approvalRepository.findReferenceInbox(companyId, personId);
        }
        return approvalRepository.findInbox(companyId, personId);
    }

    public List<Approval> getOutbox(String companyId, String personId) {
        return approvalRepository.findOutbox(companyId, personId);
    }

    public Optional<Approval> getApprovalById(String companyId, String approvalId) {
        return approvalRepository.findById(new ApprovalId(companyId, approvalId))
                .filter(a -> a.getDeleteMark() == null || "N".equals(a.getDeleteMark()));
    }

    public List<com.cmms.dto.ApprovalStepDetailDto> getApprovalSteps(String companyId, String approvalId) {
        return approvalStepRepository.findEnrichedSteps(companyId, approvalId);
    }
}
