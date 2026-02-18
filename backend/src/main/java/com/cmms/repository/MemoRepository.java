package com.cmms.repository;

import com.cmms.domain.Memo;
import com.cmms.domain.MemoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemoRepository extends JpaRepository<Memo, MemoId> {
    List<Memo> findAllByCompanyIdAndDeleteMarkIsNullOrDeleteMark(String companyId, String deleteMark);

    List<Memo> findAllByDeleteMarkIsNullOrDeleteMark(String deleteMark);
}
