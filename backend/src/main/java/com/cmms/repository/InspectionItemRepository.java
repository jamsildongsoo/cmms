package com.cmms.repository;

import com.cmms.domain.InspectionItem;
import com.cmms.domain.InspectionItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InspectionItemRepository extends JpaRepository<InspectionItem, InspectionItemId> {
    void deleteByCompanyIdAndInspectionId(String companyId, String inspectionId);
}
