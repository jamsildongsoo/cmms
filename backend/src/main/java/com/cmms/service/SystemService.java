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

    private final FileGroupRepository fileGroupRepository;
    private final FileItemRepository fileItemRepository;
    private final SequenceRepository sequenceRepository;

    // FileGroup
    @Transactional
    public FileGroup saveFileGroup(FileGroup group) {
        return fileGroupRepository.save(group);
    }

    public Optional<FileGroup> getFileGroupById(String companyId, String fileGroupId) {
        return fileGroupRepository.findById(new FileGroupId(companyId, fileGroupId))
                .filter(group -> group.getDeleteMark() == null || "N".equals(group.getDeleteMark()))
                .map(group -> {
                    group.setItems(fileItemRepository.findAllByCompanyIdAndFileGroupId(companyId, fileGroupId));
                    return group;
                });
    }

    @Transactional
    public void deleteFileGroup(String companyId, String fileGroupId) {
        fileGroupRepository.findById(new FileGroupId(companyId, fileGroupId)).ifPresent(group -> {
            group.setDeleteMark("Y");
            fileGroupRepository.save(group);
        });
    }

    // FileItem
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

    public List<FileItem> getFileItems(String companyId, String fileGroupId) {
        return fileItemRepository.findAllByCompanyIdAndFileGroupId(companyId, fileGroupId);
    }

    public Integer getNextFileItemLineNo(String companyId, String fileGroupId) {
        return fileItemRepository.findMaxLineNoByCompanyIdAndFileGroupId(companyId, fileGroupId) + 1;
    }

    // Sequence
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

    // ID Generation
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
            case "MEMO" -> "MM";
            case "APPROVAL" -> "AP";
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
