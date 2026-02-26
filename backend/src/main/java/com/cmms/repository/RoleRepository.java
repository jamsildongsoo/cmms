package com.cmms.repository;

import com.cmms.domain.Role;
import com.cmms.domain.RoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Role, RoleId> {
    List<Role> findAllByCompanyIdAndDeleteMark(String companyId, String deleteMark);
}
