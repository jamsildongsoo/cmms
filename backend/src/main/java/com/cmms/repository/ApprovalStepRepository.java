package com.cmms.repository;

import com.cmms.domain.ApprovalStep;
import com.cmms.domain.ApprovalStepId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalStepRepository extends JpaRepository<ApprovalStep, ApprovalStepId> {
    List<ApprovalStep> findAllByCompanyIdAndApprovalIdOrderByLineNoAsc(String companyId, String approvalId);
}
