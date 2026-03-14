package com.cmms.service;

import com.cmms.common.domain.CommonStatus;
import com.cmms.common.domain.DecisionType;
import com.cmms.common.domain.StepResult;
import com.cmms.domain.*;
import com.cmms.repository.ApprovalRepository;
import com.cmms.repository.ApprovalStepRepository;
import com.cmms.repository.InspectionRepository;
import com.cmms.repository.WorkOrderRepository;
import com.cmms.repository.WorkPermitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final ApprovalStepRepository approvalStepRepository;
    private final SystemService systemService;
    private final ApprovalHtmlService approvalHtmlService;
    private final InspectionRepository inspectionRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkPermitRepository workPermitRepository;

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
            approval.setStatus(CommonStatus.fromCode(targetStatus));
            if ("A".equals(targetStatus)) {
                approval.setCurrentStep(1);
            }
        } else {
            approvalRepository.findById(new ApprovalId(approval.getCompanyId(), approval.getApprovalId()))
                    .ifPresent(existing -> {
                        if (existing.getStatus() != CommonStatus.TEMPORARY) {
                            throw new IllegalStateException("임시 저장 상태가 아닌 결재 문서는 수정할 수 없습니다.");
                        }
                    });
            approval.setStatus(CommonStatus.fromCode(targetStatus));
            if ("A".equals(targetStatus)) {
                approval.setCurrentStep(1);
            }
            List<ApprovalStep> existingSteps = approvalStepRepository
                    .findAllByCompanyIdAndApprovalIdOrderByLineNoAsc(approval.getCompanyId(), approval.getApprovalId());
            approvalStepRepository.deleteAll(existingSteps);
        }

        Approval saved = approvalRepository.save(approval);

        // Insert drafter as lineNo=0 when submitting (status A)
        if ("A".equals(targetStatus) && saved.getRequesterId() != null) {
            ApprovalStep drafterStep = new ApprovalStep();
            drafterStep.setCompanyId(saved.getCompanyId());
            drafterStep.setApprovalId(saved.getApprovalId());
            drafterStep.setLineNo(0);
            drafterStep.setPersonId(saved.getRequesterId());
            drafterStep.setDecision(DecisionType.DRAFT);
            drafterStep.setResult(StepResult.APPROVED);
            drafterStep.setDecidedAt(java.time.LocalDateTime.now());
            approvalStepRepository.save(drafterStep);
        }

        if (steps != null) {
            for (ApprovalStep step : steps) {
                step.setApprovalId(saved.getApprovalId());
                step.setCompanyId(saved.getCompanyId());
                if (step.getResult() == null) {
                    step.setResult(StepResult.PENDING);
                }
                approvalStepRepository.save(step);
            }

            // [E] 결재 스텝 완료 판단 기준: lineNo >= 1인 스텝의 최대 lineNo
            int maxLineNo = steps.stream()
                    .filter(s -> s.getLineNo() != null && s.getLineNo() >= 1)
                    .mapToInt(ApprovalStep::getLineNo)
                    .max().orElse(0);

            // 상신 시 첫 스텝부터 통보(참조)인 경우 자동 승인 처리
            if ("A".equals(targetStatus) && maxLineNo > 0) {
                int stepNo = saved.getCurrentStep();
                for (ApprovalStep step : steps) {
                    if (step.getLineNo() == stepNo && step.getDecision() == DecisionType.NOTICE) {
                        step.setResult(StepResult.APPROVED);
                        step.setDecidedAt(java.time.LocalDateTime.now());
                        approvalStepRepository.save(step);
                        stepNo++;
                    } else if (step.getLineNo() >= stepNo) {
                        break;
                    }
                }
                if (stepNo != saved.getCurrentStep()) {
                    if (stepNo <= maxLineNo) {
                        saved.setCurrentStep(stepNo);
                    } else {
                        // 모든 스텝이 통보(참조)인 경우 즉시 확정
                        saved.setStatus(CommonStatus.CONFIRMED);
                    }
                    approvalRepository.save(saved);
                }
            }
        }

        // [A] 상신 시 원본 엔티티 상태 변경 (즉시 확정된 경우 'C', 아니면 'A')
        if ("A".equals(targetStatus) && saved.getRefEntity() != null && saved.getRefId() != null) {
            CommonStatus refStatus = saved.getStatus() == CommonStatus.CONFIRMED
                    ? CommonStatus.CONFIRMED : CommonStatus.APPROVAL;
            updateRefEntityStatus(saved.getCompanyId(), saved.getRefEntity(), saved.getRefId(),
                    refStatus, saved.getApprovalId());
        }

        return saved;
    }

    @Transactional
    public void processDecision(String companyId, String approvalId, String personId, String decision, String comment) {
        Approval approval = approvalRepository.findById(new ApprovalId(companyId, approvalId))
                .orElseThrow(() -> new IllegalArgumentException("Approval not found"));

        if (approval.getStatus() != CommonStatus.APPROVAL) {
            throw new IllegalStateException("상신된 문서가 아니거나 이미 결재가 종료되었습니다.");
        }

        List<ApprovalStep> steps = approvalStepRepository.findAllByCompanyIdAndApprovalIdOrderByLineNoAsc(companyId,
                approvalId);

        // [B] lineNo >= 1인 스텝만 결재 흐름 대상 (lineNo=0은 기안자)
        int maxLineNo = steps.stream()
                .filter(s -> s.getLineNo() != null && s.getLineNo() >= 1)
                .mapToInt(ApprovalStep::getLineNo)
                .max().orElse(0);

        ApprovalStep currentStep = steps.stream()
                .filter(s -> s.getLineNo().equals(approval.getCurrentStep()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Current step not found"));

        if (!currentStep.getPersonId().equals(personId)) {
            throw new IllegalStateException("현재 결재 순서가 아닙니다.");
        }

        currentStep.setComment(comment);
        currentStep.setDecidedAt(java.time.LocalDateTime.now());

        if ("REJECT".equals(decision)) {
            currentStep.setResult(StepResult.REJECTED);
            approval.setStatus(CommonStatus.REJECTED);
            if (approval.getRefEntity() != null && approval.getRefId() != null) {
                updateRefEntityStatus(companyId, approval.getRefEntity(), approval.getRefId(),
                        CommonStatus.REJECTED, approvalId);
            }
        } else {
            currentStep.setResult(StepResult.APPROVED);
            int nextStepNo = approval.getCurrentStep() + 1;

            // 통보(참조) 스텝은 자동 승인 처리하고 건너뜀
            while (nextStepNo <= maxLineNo) {
                int checkNo = nextStepNo;
                ApprovalStep nextStep = steps.stream()
                        .filter(s -> s.getLineNo().equals(checkNo))
                        .findFirst().orElse(null);
                if (nextStep != null && nextStep.getDecision() == DecisionType.NOTICE) {
                    nextStep.setResult(StepResult.APPROVED);
                    nextStep.setDecidedAt(java.time.LocalDateTime.now());
                    approvalStepRepository.save(nextStep);
                    nextStepNo++;
                } else {
                    break;
                }
            }

            if (nextStepNo <= maxLineNo) {
                approval.setCurrentStep(nextStepNo);
            } else {
                approval.setStatus(CommonStatus.CONFIRMED);
                if (approval.getRefEntity() != null && approval.getRefId() != null) {
                    updateRefEntityStatus(companyId, approval.getRefEntity(), approval.getRefId(),
                            CommonStatus.CONFIRMED, approvalId);
                }
            }
        }

        approvalStepRepository.save(currentStep);
        approvalRepository.save(approval);
    }

    /**
     * 결재 원본 엔티티 상태 변경 (상신/완료/반려 공통)
     */
    @Transactional
    public void updateRefEntityStatus(String companyId, String refEntity, String refId,
                                       CommonStatus status, String approvalId) {
        switch (refEntity.toUpperCase()) {
            case "INSPECTION":
                inspectionRepository.findById(new InspectionId(companyId, refId))
                        .ifPresent(doc -> {
                            doc.setStatus(status);
                            doc.setApprovalId(approvalId);
                            inspectionRepository.save(doc);
                        });
                break;
            case "WO", "WORK_ORDER":
                workOrderRepository.findById(new WorkOrderId(companyId, refId))
                        .ifPresent(doc -> {
                            doc.setStatus(status);
                            doc.setApprovalId(approvalId);
                            workOrderRepository.save(doc);
                        });
                break;
            case "WP", "WORK_PERMIT":
                workPermitRepository.findById(new WorkPermitId(companyId, refId))
                        .ifPresent(doc -> {
                            doc.setStatus(status);
                            doc.setApprovalId(approvalId);
                            workPermitRepository.save(doc);
                        });
                break;
            default:
                log.warn("알 수 없는 refEntity: {}", refEntity);
        }
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
