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
    List<Approval> findAllByDeleteMarkIsNullOrDeleteMark(String deleteMark);

    @Query("SELECT a FROM Approval a " +
            "WHERE a.companyId = :companyId " +
            "AND (a.deleteMark IS NULL OR a.deleteMark = 'N') " +
            "AND a.approvalId IN (" +
            "  SELECT s.approvalId FROM ApprovalStep s " +
            "  WHERE s.companyId = :companyId " +
            "  AND s.personId = :personId " +
            "  AND s.result = '00'" + // 00: Unresolved/Pending
            ")")
    List<Approval> findInbox(@Param("companyId") String companyId, @Param("personId") String personId);

    @Query("SELECT a FROM Approval a " +
            "WHERE a.companyId = :companyId " +
            "AND a.requesterId = :requesterId " +
            "AND (a.deleteMark IS NULL OR a.deleteMark = 'N')")
    List<Approval> findOutbox(@Param("companyId") String companyId, @Param("requesterId") String requesterId);
}
