package com.cmms.repository;

import com.cmms.domain.CodeItem;
import com.cmms.domain.CodeItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CodeItemRepository extends JpaRepository<CodeItem, CodeItemId> {
    List<CodeItem> findAllByCompanyIdAndCodeId(String companyId, String codeId);
}
