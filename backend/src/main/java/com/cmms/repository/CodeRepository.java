package com.cmms.repository;

import com.cmms.domain.Code;
import com.cmms.domain.CodeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeRepository extends JpaRepository<Code, CodeId> {
    List<Code> findAllByDeleteMarkIsNullOrDeleteMark(String deleteMark);
}
