package com.cmms.repository;

import com.cmms.domain.FileGroup;
import com.cmms.domain.FileGroupId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileGroupRepository extends JpaRepository<FileGroup, FileGroupId> {
    List<FileGroup> findAllByCompanyIdAndDeleteMark(String companyId, String deleteMark);
}
