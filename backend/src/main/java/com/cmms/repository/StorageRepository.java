package com.cmms.repository;

import com.cmms.domain.Storage;
import com.cmms.domain.StorageId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StorageRepository extends JpaRepository<Storage, StorageId> {
    List<Storage> findAllByDeleteMarkIsNullOrDeleteMark(String deleteMark);
}
