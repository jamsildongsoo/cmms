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
        }
        return equipmentRepository.save(equipment);
    }

    public List<Equipment> getAllEquipments() {
        return equipmentRepository.findAllByDeleteMarkIsNullOrDeleteMark("N");
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
        }
        return inventoryRepository.save(inventory);
    }

    public List<Inventory> getAllInventories() {
        return inventoryRepository.findAllByDeleteMarkIsNullOrDeleteMark("N");
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
