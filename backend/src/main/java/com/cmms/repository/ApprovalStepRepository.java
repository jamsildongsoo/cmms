package com.cmms.repository;

import com.cmms.domain.ApprovalStep;
import com.cmms.domain.ApprovalStepId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.cmms.dto.ApprovalStepDetailDto;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ApprovalStepRepository extends JpaRepository<ApprovalStep, ApprovalStepId> {
    List<ApprovalStep> findAllByCompanyIdAndApprovalIdOrderByLineNoAsc(String companyId, String approvalId);

    @Query("SELECT new com.cmms.dto.ApprovalStepDetailDto(" +
            "s.companyId, s.approvalId, s.lineNo, s.personId, p.name, p.position, p.title, " +
            "s.decision, s.result, s.decidedAt, s.comment) " +
            "FROM ApprovalStep s " +
            "LEFT JOIN Person p ON s.companyId = p.companyId AND s.personId = p.personId " +
            "WHERE s.companyId = :companyId AND s.approvalId = :approvalId " +
            "ORDER BY s.lineNo ASC")
    List<ApprovalStepDetailDto> findEnrichedSteps(@Param("companyId") String companyId,
            @Param("approvalId") String approvalId);
}
