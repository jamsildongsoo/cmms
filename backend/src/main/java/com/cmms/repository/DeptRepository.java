package com.cmms.repository;

import com.cmms.domain.Dept;
import com.cmms.domain.DeptId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeptRepository extends JpaRepository<Dept, DeptId> {
    List<Dept> findAllByCompanyIdAndDeleteMark(String companyId, String deleteMark);
}
