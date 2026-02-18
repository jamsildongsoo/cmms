package com.cmms.controller;

import com.cmms.domain.*;
import com.cmms.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inv")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/stocks")
    public InventoryStock createStock(@RequestBody InventoryStock stock) {
        return inventoryService.saveStock(stock);
    }

    @GetMapping("/stocks")
    public List<InventoryStock> getStocks() {
        return inventoryService.getAllStocks();
    }

    @GetMapping("/stocks/{companyId}/{storageId}/{inventoryId}")
    public ResponseEntity<InventoryStock> getStock(@PathVariable String companyId, @PathVariable String storageId,
            @PathVariable String inventoryId) {
        return inventoryService.getStockById(companyId, storageId, inventoryId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/stocks/{companyId}/{storageId}/{inventoryId}")
    public ResponseEntity<Void> deleteStock(@PathVariable String companyId, @PathVariable String storageId,
            @PathVariable String inventoryId) {
        inventoryService.deleteStock(companyId, storageId, inventoryId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/history")
    public InventoryHistory createHistory(@RequestBody InventoryHistory history) {
        return inventoryService.saveHistory(history);
    }

    @GetMapping("/history")
    public List<InventoryHistory> getHistory() {
        return inventoryService.getAllHistories();
    }

    @GetMapping("/history/{companyId}/{storageId}/{inventoryId}/{historyId}")
    public ResponseEntity<InventoryHistory> getHistory(@PathVariable String companyId, @PathVariable String storageId,
            @PathVariable String inventoryId, @PathVariable String historyId) {
        return inventoryService.getHistoryById(companyId, storageId, inventoryId, historyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/history/{companyId}/{storageId}/{inventoryId}/{historyId}")
    public ResponseEntity<Void> deleteHistory(@PathVariable String companyId, @PathVariable String storageId,
            @PathVariable String inventoryId, @PathVariable String historyId) {
        inventoryService.deleteHistory(companyId, storageId, inventoryId, historyId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/closings")
    public InventoryClosing createClosing(@RequestBody InventoryClosing closing) {
        return inventoryService.saveClosing(closing);
    }

    @GetMapping("/closings")
    public List<InventoryClosing> getClosings() {
        return inventoryService.getAllClosings();
    }

    @GetMapping("/closings/{companyId}/{storageId}/{inventoryId}/{yyyymm}")
    public ResponseEntity<InventoryClosing> getClosing(@PathVariable String companyId, @PathVariable String storageId,
            @PathVariable String inventoryId, @PathVariable String yyyymm) {
        return inventoryService.getClosingById(companyId, storageId, inventoryId, yyyymm)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/closings/{companyId}/{storageId}/{inventoryId}/{yyyymm}")
    public ResponseEntity<Void> deleteClosing(@PathVariable String companyId, @PathVariable String storageId,
            @PathVariable String inventoryId, @PathVariable String yyyymm) {
        inventoryService.deleteClosing(companyId, storageId, inventoryId, yyyymm);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/transactions")
    public ResponseEntity<Void> processTransaction(@RequestBody com.cmms.dto.InventoryTransactionRequest request) {
        inventoryService.processTransaction(request);
        return ResponseEntity.ok().build();
    }
}
