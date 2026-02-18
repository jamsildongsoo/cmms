package com.cmms.service;

import com.cmms.domain.Memo;
import com.cmms.domain.MemoId;
import com.cmms.repository.MemoRepository;
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

    @Transactional
    public Memo saveMemo(Memo memo) {
        return memoRepository.save(memo);
    }

    public List<Memo> getMemos(String companyId) {
        return memoRepository.findAllByCompanyIdAndDeleteMarkIsNullOrDeleteMark(companyId, "N");
    }

    public Optional<Memo> getMemoById(String companyId, String memoId) {
        return memoRepository.findById(new MemoId(companyId, memoId))
                .filter(m -> m.getDeleteMark() == null || "N".equals(m.getDeleteMark()));
    }
}
