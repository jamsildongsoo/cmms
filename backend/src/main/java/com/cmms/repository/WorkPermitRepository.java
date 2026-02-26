package com.cmms.repository;

import com.cmms.domain.WorkPermit;
import com.cmms.domain.WorkPermitId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;

@Repository
public interface WorkPermitRepository extends JpaRepository<WorkPermit, WorkPermitId> {
    @EntityGraph(attributePaths = { "items" })
    List<WorkPermit> findAllByCompanyIdAndDeleteMark(String companyId, String deleteMark);
}
