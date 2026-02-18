package com.cmms.repository;

import com.cmms.domain.WorkPermit;
import com.cmms.domain.WorkPermitId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkPermitRepository extends JpaRepository<WorkPermit, WorkPermitId> {
    List<WorkPermit> findAllByDeleteMarkIsNullOrDeleteMark(String deleteMark);
}
