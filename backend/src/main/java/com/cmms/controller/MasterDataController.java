package com.cmms.controller;

import com.cmms.common.security.SecurityUtil;
import com.cmms.domain.*;
import com.cmms.service.MasterDataService;
import com.cmms.service.ExcelUploadService;
import com.cmms.dto.ExcelUploadResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/master")
@RequiredArgsConstructor
public class MasterDataController {

    private final MasterDataService masterDataService;
    private final ExcelUploadService excelUploadService;
    private final com.cmms.service.ExcelDownloadService excelDownloadService;

    @PostMapping("/equipment/download")
    public ResponseEntity<byte[]> downloadEquipment(@RequestBody List<Equipment> list, Authentication auth) throws Exception {
        SecurityUtil.getCompanyId(auth); // verify authenticated
        byte[] bytes = excelDownloadService.downloadEquipment(list);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=equipment_list.xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(bytes);
    }

    @PostMapping("/inventory/download")
    public ResponseEntity<byte[]> downloadInventory(@RequestBody List<Inventory> list, Authentication auth) throws Exception {
        SecurityUtil.getCompanyId(auth); // verify authenticated
        byte[] bytes = excelDownloadService.downloadInventory(list);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=inventory_list.xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(bytes);
    }

    @GetMapping("/equipment/template")
    public ResponseEntity<byte[]> equipmentTemplate(Authentication auth) throws Exception {
        SecurityUtil.getCompanyId(auth);
        byte[] bytes = excelDownloadService.equipmentTemplate();
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=equipment_template.xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(bytes);
    }

    @GetMapping("/inventory/template")
    public ResponseEntity<byte[]> inventoryTemplate(Authentication auth) throws Exception {
        SecurityUtil.getCompanyId(auth);
        byte[] bytes = excelDownloadService.inventoryTemplate();
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=inventory_template.xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(bytes);
    }

    @PostMapping("/equipment/validate")
    public ResponseEntity<ExcelUploadResult> validateEquipment(@RequestParam("file") MultipartFile file, Authentication auth) throws Exception {
        return ResponseEntity.ok(excelUploadService.validateEquipment(SecurityUtil.getCompanyId(auth), file));
    }

    @PostMapping("/equipment/upload")
    public ResponseEntity<ExcelUploadResult> uploadEquipment(@RequestParam("file") MultipartFile file, Authentication auth) throws Exception {
        return ResponseEntity.ok(excelUploadService.uploadEquipment(SecurityUtil.getCompanyId(auth), file));
    }

    @PostMapping("/inventory/validate")
    public ResponseEntity<ExcelUploadResult> validateInventory(@RequestParam("file") MultipartFile file, Authentication auth) throws Exception {
        return ResponseEntity.ok(excelUploadService.validateInventory(SecurityUtil.getCompanyId(auth), file));
    }

    @PostMapping("/inventory/upload")
    public ResponseEntity<ExcelUploadResult> uploadInventory(@RequestParam("file") MultipartFile file, Authentication auth) throws Exception {
        return ResponseEntity.ok(excelUploadService.uploadInventory(SecurityUtil.getCompanyId(auth), file));
    }

    @PostMapping("/equipment")
    public Equipment createEquipment(@RequestBody Equipment equipment, Authentication auth) {
        equipment.setCompanyId(SecurityUtil.getCompanyId(auth));
        return masterDataService.saveEquipment(equipment);
    }

    @GetMapping("/equipment")
    public List<Equipment> getEquipment(Authentication auth) {
        return masterDataService.getAllEquipments(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/equipment/{equipmentId}")
    public ResponseEntity<Equipment> getEquipment(@PathVariable String equipmentId, Authentication auth) {
        return masterDataService.getEquipmentById(SecurityUtil.getCompanyId(auth), equipmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/equipment/{equipmentId}")
    public ResponseEntity<Void> deleteEquipment(@PathVariable String equipmentId, Authentication auth) {
        return masterDataService.deleteEquipment(SecurityUtil.getCompanyId(auth), equipmentId)
                ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("/inventory")
    public Inventory createInventory(@RequestBody Inventory inventory, Authentication auth) {
        inventory.setCompanyId(SecurityUtil.getCompanyId(auth));
        return masterDataService.saveInventory(inventory);
    }

    @GetMapping("/inventory")
    public List<Inventory> getInventory(Authentication auth) {
        return masterDataService.getAllInventories(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/inventory/{inventoryId}")
    public ResponseEntity<Inventory> getInventory(@PathVariable String inventoryId, Authentication auth) {
        return masterDataService.getInventoryById(SecurityUtil.getCompanyId(auth), inventoryId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/inventory/{inventoryId}")
    public ResponseEntity<Void> deleteInventory(@PathVariable String inventoryId, Authentication auth) {
        return masterDataService.deleteInventory(SecurityUtil.getCompanyId(auth), inventoryId)
                ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }
}
