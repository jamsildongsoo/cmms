package com.cmms.service;

import com.cmms.domain.*;
import com.cmms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SystemService {

    private final MemoRepository memoRepository;
    private final ApprovalRepository approvalRepository;
    private final ApprovalStepRepository approvalStepRepository;
    private final FileGroupRepository fileGroupRepository;
    private final FileItemRepository fileItemRepository;
    private final SequenceRepository sequenceRepository;

    @Transactional
    public Memo saveMemo(Memo memo) {
        return memoRepository.save(memo);
    }

    public List<Memo> getAllMemos() {
        return memoRepository.findAllByDeleteMarkIsNullOrDeleteMark("N");
    }

    public Optional<Memo> getMemoById(String companyId, String memoId) {
        return memoRepository.findById(new MemoId(companyId, memoId))
                .filter(memo -> memo.getDeleteMark() == null || "N".equals(memo.getDeleteMark()));
    }

    @Transactional
    public void deleteMemo(String companyId, String memoId) {
        memoRepository.findById(new MemoId(companyId, memoId)).ifPresent(memo -> {
            memo.setDeleteMark("Y");
            memoRepository.save(memo);
        });
    }

    @Transactional
    public Approval saveApproval(Approval approval) {
        return approvalRepository.save(approval);
    }

    public List<Approval> getAllApprovals() {
        return approvalRepository.findAllByDeleteMarkIsNullOrDeleteMark("N");
    }

    public Optional<Approval> getApprovalById(String companyId, String approvalId) {
        return approvalRepository.findById(new ApprovalId(companyId, approvalId))
                .filter(approval -> approval.getDeleteMark() == null || "N".equals(approval.getDeleteMark()));
    }

    @Transactional
    public void deleteApproval(String companyId, String approvalId) {
        approvalRepository.findById(new ApprovalId(companyId, approvalId)).ifPresent(approval -> {
            approval.setDeleteMark("Y");
            approvalRepository.save(approval);
        });
    }

    @Transactional
    public ApprovalStep saveApprovalStep(ApprovalStep step) {
        return approvalStepRepository.save(step);
    }

    public Optional<ApprovalStep> getApprovalStepById(String companyId, String approvalId, Integer lineNo) {
        return approvalStepRepository.findById(new ApprovalStepId(companyId, approvalId, lineNo));
    }

    @Transactional
    public void deleteApprovalStep(String companyId, String approvalId, Integer lineNo) {
        approvalStepRepository.deleteById(new ApprovalStepId(companyId, approvalId, lineNo));
    }

    @Transactional
    public FileGroup saveFileGroup(FileGroup group) {
        return fileGroupRepository.save(group);
    }

    public Optional<FileGroup> getFileGroupById(String companyId, String fileGroupId) {
        return fileGroupRepository.findById(new FileGroupId(companyId, fileGroupId))
                .filter(group -> group.getDeleteMark() == null || "N".equals(group.getDeleteMark()));
    }

    @Transactional
    public void deleteFileGroup(String companyId, String fileGroupId) {
        fileGroupRepository.findById(new FileGroupId(companyId, fileGroupId)).ifPresent(group -> {
            group.setDeleteMark("Y");
            fileGroupRepository.save(group);
        });
    }

    @Transactional
    public FileItem saveFileItem(FileItem item) {
        return fileItemRepository.save(item);
    }

    public Optional<FileItem> getFileItemById(String companyId, String fileGroupId, Integer lineNo) {
        return fileItemRepository.findById(new FileItemId(companyId, fileGroupId, lineNo));
    }

    @Transactional
    public void deleteFileItem(String companyId, String fileGroupId, Integer lineNo) {
        fileItemRepository.deleteById(new FileItemId(companyId, fileGroupId, lineNo));
    }

    public Integer getNextFileItemLineNo(String companyId, String fileGroupId) {
        return fileItemRepository.findMaxLineNoByCompanyIdAndFileGroupId(companyId, fileGroupId) + 1;
    }

    @Transactional
    public Sequence saveSequence(Sequence sequence) {
        return sequenceRepository.save(sequence);
    }

    public List<Sequence> getAllSequences() {
        return sequenceRepository.findAll();
    }

    public Optional<Sequence> getSequenceById(String companyId, String refEntity, String dateKey) {
        return sequenceRepository.findById(new SequenceId(companyId, refEntity, dateKey));
    }

    @Transactional
    public void deleteSequence(String companyId, String refEntity, String dateKey) {
        sequenceRepository.deleteById(new SequenceId(companyId, refEntity, dateKey));
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public String generateId(String companyId, String refEntity, String dateKey) {
        // 1. Prefix Mapping (2 chars)
        String prefix = switch (refEntity) {
            case "EQUIPMENT" -> "EQ";
            case "INVENTORY" -> "MT"; // Material
            case "INSPECTION" -> "IN";
            case "WORK_ORDER" -> "WO";
            case "WORK_PERMIT" -> "WP";
            case "FILE_GROUP" -> "FG";
            default -> "XX";
        };

        // 2. Fetch Sequence with Lock
        Sequence sequence = sequenceRepository.findByCompanyIdAndRefEntityAndDateKey(companyId, refEntity, dateKey)
                .orElseGet(() -> {
                    Sequence newSeq = new Sequence();
                    newSeq.setCompanyId(companyId);
                    newSeq.setRefEntity(refEntity);
                    newSeq.setDateKey(dateKey);
                    newSeq.setNextSeq(1L);
                    return sequenceRepository.save(newSeq);
                });

        // 3. Generate ID
        long seq = sequence.getNextSeq();
        sequence.setNextSeq(seq + 1);
        sequenceRepository.save(sequence);

        // Format: {PREFIX}{YYYYMM}{SEQ} or {PREFIX}{SEQ}
        if ("GLOBAL".equals(dateKey)) {
            // Master Data: EQ000001
            return String.format("%s%06d", prefix, seq);
        } else {
            // Transaction Data: WO202402000001
            return String.format("%s%s%06d", prefix, dateKey, seq);
        }
    }
}
