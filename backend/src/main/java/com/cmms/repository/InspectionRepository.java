package com.cmms.repository;

import com.cmms.domain.Inspection;
import com.cmms.domain.InspectionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, InspectionId> {
    @EntityGraph(attributePaths = { "items" })
    List<Inspection> findAllByCompanyIdAndDeleteMark(String companyId, String deleteMark);
}
