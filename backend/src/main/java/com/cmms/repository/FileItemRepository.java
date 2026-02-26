package com.cmms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.cmms.domain.FileItem;
import com.cmms.domain.FileItemId;

@Repository
public interface FileItemRepository extends JpaRepository<FileItem, FileItemId> {
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(MAX(f.lineNo), 0) FROM FileItem f WHERE f.companyId = :companyId AND f.fileGroupId = :fileGroupId")
    Integer findMaxLineNoByCompanyIdAndFileGroupId(
            @org.springframework.data.repository.query.Param("companyId") String companyId,
            @org.springframework.data.repository.query.Param("fileGroupId") String fileGroupId);

    @org.springframework.data.jpa.repository.Query("SELECT f FROM FileItem f WHERE f.companyId = :companyId AND f.fileGroupId = :fileGroupId")
    java.util.List<FileItem> findAllByCompanyIdAndFileGroupId(
            @org.springframework.data.repository.query.Param("companyId") String companyId,
            @org.springframework.data.repository.query.Param("fileGroupId") String fileGroupId);
}
