package com.cmms.controller;

import com.cmms.domain.*;
import com.cmms.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master")
@RequiredArgsConstructor
public class MasterDataController {

    private final MasterDataService masterDataService;

    @PostMapping("/equipment")
    public Equipment createEquipment(@RequestBody Equipment equipment) {
        return masterDataService.saveEquipment(equipment);
    }

    @GetMapping("/equipment")
    public List<Equipment> getEquipment() {
        return masterDataService.getAllEquipments();
    }

    @GetMapping("/equipment/{companyId}/{equipmentId}")
    public ResponseEntity<Equipment> getEquipment(@PathVariable String companyId, @PathVariable String equipmentId) {
        return masterDataService.getEquipmentById(companyId, equipmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/equipment/{companyId}/{equipmentId}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable String companyId, @PathVariable String equipmentId) {
        masterDataService.deleteEquipment(companyId, equipmentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/inventory")
    public Inventory createInventory(@RequestBody Inventory inventory) {
        return masterDataService.saveInventory(inventory);
    }

    @GetMapping("/inventory")
    public List<Inventory> getInventory() {
        return masterDataService.getAllInventories();
    }

    @GetMapping("/inventory/{companyId}/{inventoryId}")
    public ResponseEntity<Inventory> getInventory(@PathVariable String companyId, @PathVariable String inventoryId) {
        return masterDataService.getInventoryById(companyId, inventoryId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/inventory/{companyId}/{inventoryId}")
    public ResponseEntity<Void> deleteInventory(@PathVariable String companyId, @PathVariable String inventoryId) {
        masterDataService.deleteInventory(companyId, inventoryId);
        return ResponseEntity.ok().build();
    }
}
