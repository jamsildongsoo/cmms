package com.cmms.repository;

import com.cmms.domain.Equipment;
import com.cmms.domain.EquipmentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, EquipmentId> {
    List<Equipment> findAllByDeleteMarkIsNullOrDeleteMark(String deleteMark);
}
