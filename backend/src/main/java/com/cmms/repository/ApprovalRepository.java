package com.cmms.repository;

import com.cmms.domain.Approval;
import com.cmms.domain.ApprovalId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, ApprovalId> {
        List<Approval> findAllByCompanyIdAndDeleteMark(String companyId, String deleteMark);

        @Query("SELECT a FROM Approval a " +
                        "WHERE a.companyId = :companyId " +
                        "AND a.status = 'A' " + // Under approval
                        "AND (a.deleteMark IS NULL OR a.deleteMark = 'N') " +
                        "AND a.approvalId IN (" +
                        "  SELECT s.approvalId FROM ApprovalStep s " +
                        "  WHERE s.companyId = :companyId " +
                        "  AND s.personId = :personId " +
                        "  AND s.lineNo = a.currentStep " + // Current turn
                        "  AND s.result = '00'" + // Pending/Unresolved
                        ")")
        List<Approval> findInbox(@Param("companyId") String companyId, @Param("personId") String personId);

        // 기결함 (Completed): 본인이 결재를 수행한(Y/N) 문서
        @Query("SELECT a FROM Approval a " +
                        "WHERE a.companyId = :companyId " +
                        "AND (a.deleteMark IS NULL OR a.deleteMark = 'N') " +
                        "AND a.status IN ('C', 'R') " + // Finalized (Confirmed or Rejected)
                        "AND a.approvalId IN (" +
                        "  SELECT s.approvalId FROM ApprovalStep s " +
                        "  WHERE s.companyId = :companyId " +
                        "  AND s.personId = :personId " +
                        ")")
        List<Approval> findCompletedInbox(@Param("companyId") String companyId, @Param("personId") String personId);

        // 참조/통보함 (Reference): 본인이 참조자(decision = '03')인 문서
        @Query("SELECT a FROM Approval a " +
                        "WHERE a.companyId = :companyId " +
                        "AND (a.deleteMark IS NULL OR a.deleteMark = 'N') " +
                        "AND a.approvalId IN (" +
                        "  SELECT s.approvalId FROM ApprovalStep s " +
                        "  WHERE s.companyId = :companyId " +
                        "  AND s.personId = :personId " +
                        "  AND s.decision = '03'" + // 03: 통보/참조
                        ")")
        List<Approval> findReferenceInbox(@Param("companyId") String companyId, @Param("personId") String personId);

        @Query("SELECT a FROM Approval a " +
                        "WHERE a.companyId = :companyId " +
                        "AND a.requesterId = :requesterId " +
                        "AND a.status IN ('A', 'C', 'R') " + // Sent, Confirmed, or Rejected (Exclude 'T')
                        "AND (a.deleteMark IS NULL OR a.deleteMark = 'N')")
        List<Approval> findOutbox(@Param("companyId") String companyId, @Param("requesterId") String requesterId);
}
