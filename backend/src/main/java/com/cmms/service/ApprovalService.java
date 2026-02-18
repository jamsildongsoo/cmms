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

    @Transactional
    public Approval createApproval(Approval approval, List<ApprovalStep> steps) {
        // Generate ID if not present (Done in Controller or Service?)
        // Assuming ID is passed or generated.

        Approval saved = approvalRepository.save(approval);
        for (ApprovalStep step : steps) {
            step.setApprovalId(saved.getApprovalId());
            step.setCompanyId(saved.getCompanyId());
            approvalStepRepository.save(step);
        }
        return saved;
    }

    public List<Approval> getInbox(String companyId, String personId) {
        return approvalRepository.findInbox(companyId, personId);
    }

    public List<Approval> getOutbox(String companyId, String personId) {
        return approvalRepository.findOutbox(companyId, personId);
    }

    public Optional<Approval> getApprovalById(String companyId, String approvalId) {
        return approvalRepository.findById(new ApprovalId(companyId, approvalId))
                .filter(a -> a.getDeleteMark() == null || "N".equals(a.getDeleteMark()));
    }

    // Helper to get steps
    public List<ApprovalStep> getApprovalSteps(String companyId, String approvalId) {
        return approvalStepRepository.findAllByCompanyIdAndApprovalIdOrderByLineNoAsc(companyId, approvalId);
    }
}
