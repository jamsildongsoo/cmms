package com.cmms.service;

import com.cmms.domain.*;
import com.cmms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MasterDataService {

    private final EquipmentRepository equipmentRepository;
    private final InventoryRepository inventoryRepository;
    private final SystemService systemService;

    // Equipment
    @Transactional
    public Equipment saveEquipment(Equipment equipment) {
        if (equipment.getEquipmentId() == null || equipment.getEquipmentId().isBlank()) {
            equipment.setEquipmentId(systemService.generateId(equipment.getCompanyId(), "EQUIPMENT", "GLOBAL"));
        } else {
            // Check existing for status 'C'
            equipmentRepository.findById(new EquipmentId(equipment.getCompanyId(), equipment.getEquipmentId()))
                    .ifPresent(existing -> {
                        if ("C".equals(existing.getStatus()) && !"C".equals(equipment.getStatus())) {
                            throw new IllegalStateException("확정된 마스터 데이터는 수정할 수 없습니다.");
                        }
                    });
        }

        if (equipment.getStatus() == null) {
            equipment.setStatus("T");
        }

        return equipmentRepository.save(equipment);
    }

    public List<Equipment> getAllEquipments(String companyId) {
        return equipmentRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
    }

    public Optional<Equipment> getEquipmentById(String companyId, String equipmentId) {
        return equipmentRepository.findById(new EquipmentId(companyId, equipmentId))
                .filter(equipment -> equipment.getDeleteMark() == null || "N".equals(equipment.getDeleteMark()));
    }

    @Transactional
    public void deleteEquipment(String companyId, String equipmentId) {
        equipmentRepository.findById(new EquipmentId(companyId, equipmentId)).ifPresent(equipment -> {
            equipment.setDeleteMark("Y");
            equipmentRepository.save(equipment);
        });
    }

    // Inventory
    @Transactional
    public Inventory saveInventory(Inventory inventory) {
        if (inventory.getInventoryId() == null || inventory.getInventoryId().isBlank()) {
            inventory.setInventoryId(systemService.generateId(inventory.getCompanyId(), "INVENTORY", "GLOBAL"));
        } else {
            inventoryRepository.findById(new InventoryId(inventory.getCompanyId(), inventory.getInventoryId()))
                    .ifPresent(existing -> {
                        if ("C".equals(existing.getStatus()) && !"C".equals(inventory.getStatus())) {
                            throw new IllegalStateException("확정된 자재 마스터 데이터는 수정할 수 없습니다.");
                        }
                    });
        }

        if (inventory.getStatus() == null) {
            inventory.setStatus("T");
        }

        return inventoryRepository.save(inventory);
    }

    public List<Inventory> getAllInventories(String companyId) {
        return inventoryRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
    }

    public Optional<Inventory> getInventoryById(String companyId, String inventoryId) {
        return inventoryRepository.findById(new InventoryId(companyId, inventoryId))
                .filter(inventory -> inventory.getDeleteMark() == null || "N".equals(inventory.getDeleteMark()));
    }

    @Transactional
    public void deleteInventory(String companyId, String inventoryId) {
        inventoryRepository.findById(new InventoryId(companyId, inventoryId)).ifPresent(inventory -> {
            inventory.setDeleteMark("Y");
            inventoryRepository.save(inventory);
        });
    }
}
