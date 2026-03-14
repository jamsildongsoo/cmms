package com.cmms.service;

import com.cmms.common.domain.CommonStatus;
import com.cmms.domain.Memo;
import com.cmms.domain.MemoId;
import com.cmms.domain.MemoComment;
import com.cmms.domain.MemoCommentId;
import com.cmms.repository.MemoRepository;
import com.cmms.repository.MemoCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemoService {

    private final MemoRepository memoRepository;
    private final MemoCommentRepository memoCommentRepository;
    private final SystemService systemService;

    @Transactional
    public Memo saveMemo(Memo memo) {
        if (memo.getMemoId() == null || memo.getMemoId().isBlank()) {
            memo.setMemoId(systemService.generateId(memo.getCompanyId(), "MEMO",
                    java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMM"))));
            // status should be decided by the client (T or C), but default to T if null
            if (memo.getStatus() == null) {
                memo.setStatus(CommonStatus.TEMPORARY);
            }
        } else {
            memoRepository.findById(new MemoId(memo.getCompanyId(), memo.getMemoId())).ifPresent(existing -> {
                if (existing.getStatus() == CommonStatus.CONFIRMED) {
                    throw new IllegalStateException("확정된 메모(C)는 수정할 수 없습니다.");
                }
            });
            if (memo.getStatus() == null) {
                memo.setStatus(CommonStatus.TEMPORARY);
            }
        }
        return memoRepository.save(memo);
    }

    @Transactional
    public void deleteMemo(String companyId, String memoId, String personId) {
        memoRepository.findById(new MemoId(companyId, memoId)).ifPresent(existing -> {
            if (existing.getStatus() == CommonStatus.CONFIRMED) {
                throw new IllegalStateException("확정된 메모(C)는 삭제할 수 없습니다.");
            }
            if (!personId.equals(existing.getCreatedBy())) {
                throw new IllegalStateException("본인이 작성한 메모만 삭제할 수 있습니다.");
            }
            existing.setDeleteMark("Y");
            memoRepository.save(existing);
        });
    }

    public List<Memo> getMemos(String companyId) {
        return memoRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
    }

    public Optional<Memo> getMemoById(String companyId, String memoId) {
        return memoRepository.findById(new MemoId(companyId, memoId))
                .filter(m -> m.getDeleteMark() == null || "N".equals(m.getDeleteMark()));
    }

    // Comment operations
    public List<MemoComment> getComments(String companyId, String memoId) {
        return memoCommentRepository.findCommentsByMemoId(companyId, memoId);
    }

    @Transactional
    public MemoComment addComment(String companyId, String memoId, String authorId, String content) {
        Integer nextId = memoCommentRepository.getNextCommentId(companyId, memoId);
        MemoComment comment = new MemoComment();
        comment.setCompanyId(companyId);
        comment.setMemoId(memoId);
        comment.setCommentId(nextId);
        comment.setAuthorId(authorId);
        comment.setContent(content);
        return memoCommentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(String companyId, String memoId, Integer commentId, String personId) {
        memoCommentRepository.findById(new MemoCommentId(companyId, memoId, commentId)).ifPresent(comment -> {
            if (!personId.equals(comment.getAuthorId())) {
                throw new IllegalStateException("본인이 작성한 댓글만 삭제할 수 있습니다.");
            }
            memoCommentRepository.delete(comment);
        });
    }
}
