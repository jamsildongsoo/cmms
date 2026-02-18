package com.cmms.repository;

import com.cmms.domain.WorkPermitItem;
import com.cmms.domain.WorkPermitItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkPermitItemRepository extends JpaRepository<WorkPermitItem, WorkPermitItemId> {
    void deleteByCompanyIdAndPermitId(String companyId, String permitId);
}
