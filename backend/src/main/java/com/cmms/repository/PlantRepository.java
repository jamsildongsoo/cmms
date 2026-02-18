package com.cmms.repository;

import com.cmms.domain.Plant;
import com.cmms.domain.PlantId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlantRepository extends JpaRepository<Plant, PlantId> {
    List<Plant> findAllByDeleteMarkIsNullOrDeleteMark(String deleteMark);
}
