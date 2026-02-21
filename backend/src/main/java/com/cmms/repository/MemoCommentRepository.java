package com.cmms.repository;

import com.cmms.domain.MemoComment;
import com.cmms.domain.MemoCommentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MemoCommentRepository extends JpaRepository<MemoComment, MemoCommentId> {

    @Query("SELECT mc FROM MemoComment mc WHERE mc.companyId = :companyId AND mc.memoId = :memoId ORDER BY mc.commentId ASC")
    List<MemoComment> findCommentsByMemoId(@Param("companyId") String companyId, @Param("memoId") String memoId);

    @Query("SELECT COALESCE(MAX(mc.commentId), 0) + 1 FROM MemoComment mc WHERE mc.companyId = :companyId AND mc.memoId = :memoId")
    Integer getNextCommentId(@Param("companyId") String companyId, @Param("memoId") String memoId);
}
