package com.cmms.repository;

import com.cmms.domain.Inspection;
import com.cmms.domain.InspectionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, InspectionId> {
    List<Inspection> findAllByDeleteMarkIsNullOrDeleteMark(String deleteMark);
}
