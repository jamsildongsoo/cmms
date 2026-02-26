package com.cmms.repository;

import com.cmms.domain.Person;
import com.cmms.domain.PersonId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonRepository extends JpaRepository<Person, PersonId> {
    List<Person> findAllByCompanyIdAndDeleteMark(String companyId, String deleteMark);
}
