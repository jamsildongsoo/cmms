package com.cmms.controller;

import com.cmms.domain.*;
import com.cmms.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/equipment")
    public List<Equipment> getEquipment(@RequestParam String companyId) {
        return masterDataService.getAllEquipments(companyId);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/equipment/{companyId}/{equipmentId}")
    public ResponseEntity<Equipment> getEquipment(@PathVariable String companyId, @PathVariable String equipmentId) {
        return masterDataService.getEquipmentById(companyId, equipmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @DeleteMapping("/equipment/{companyId}/{equipmentId}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable String companyId, @PathVariable String equipmentId) {
        masterDataService.deleteEquipment(companyId, equipmentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/inventory")
    public Inventory createInventory(@RequestBody Inventory inventory) {
        return masterDataService.saveInventory(inventory);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/inventory")
    public List<Inventory> getInventory(@RequestParam String companyId) {
        return masterDataService.getAllInventories(companyId);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/inventory/{companyId}/{inventoryId}")
    public ResponseEntity<Inventory> getInventory(@PathVariable String companyId, @PathVariable String inventoryId) {
        return masterDataService.getInventoryById(companyId, inventoryId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @DeleteMapping("/inventory/{companyId}/{inventoryId}")
    public ResponseEntity<Void> deleteInventory(@PathVariable String companyId, @PathVariable String inventoryId) {
        masterDataService.deleteInventory(companyId, inventoryId);
        return ResponseEntity.ok().build();
    }
}
