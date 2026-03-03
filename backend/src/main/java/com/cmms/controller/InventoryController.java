package com.cmms.controller;

import com.cmms.domain.*;
import com.cmms.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inv")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PreAuthorize("principal.startsWith(#stock.companyId)")
    @PostMapping("/stocks")
    public InventoryStock createStock(@RequestBody InventoryStock stock) {
        return inventoryService.saveStock(stock);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/stocks")
    public List<InventoryStock> getStocks(@RequestParam String companyId) {
        return inventoryService.getAllStocks(companyId);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/stocks/{companyId}/{storageId}/{binId}/{locationId}/{inventoryId}")
    public ResponseEntity<InventoryStock> getStock(@PathVariable String companyId, @PathVariable String storageId,
            @PathVariable String binId, @PathVariable String locationId, @PathVariable String inventoryId) {
        return inventoryService.getStockById(companyId, storageId, binId, locationId, inventoryId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @DeleteMapping("/stocks/{companyId}/{storageId}/{binId}/{locationId}/{inventoryId}")
    public ResponseEntity<Void> deleteStock(@PathVariable String companyId, @PathVariable String storageId,
            @PathVariable String binId, @PathVariable String locationId, @PathVariable String inventoryId) {
        inventoryService.deleteStock(companyId, storageId, binId, locationId, inventoryId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("principal.startsWith(#history.companyId)")
    @PostMapping("/history")
    public InventoryHistory createHistory(@RequestBody InventoryHistory history) {
        return inventoryService.saveHistory(history);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/history")
    public List<InventoryHistory> getHistory(@RequestParam String companyId) {
        return inventoryService.getAllHistories(companyId);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/history/{companyId}/{storageId}/{binId}/{locationId}/{inventoryId}/{historyId}")
    public ResponseEntity<InventoryHistory> getHistory(@PathVariable String companyId, @PathVariable String storageId,
            @PathVariable String binId, @PathVariable String locationId, @PathVariable String inventoryId,
            @PathVariable String historyId) {
        return inventoryService.getHistoryById(companyId, storageId, binId, locationId, inventoryId, historyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @DeleteMapping("/history/{companyId}/{storageId}/{binId}/{locationId}/{inventoryId}/{historyId}")
    public ResponseEntity<Void> deleteHistory(@PathVariable String companyId, @PathVariable String storageId,
            @PathVariable String binId, @PathVariable String locationId, @PathVariable String inventoryId,
            @PathVariable String historyId) {
        inventoryService.deleteHistory(companyId, storageId, binId, locationId, inventoryId, historyId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("principal.startsWith(#closing.companyId)")
    @PostMapping("/closings")
    public InventoryClosing createClosing(@RequestBody InventoryClosing closing) {
        return inventoryService.saveClosing(closing);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/closings")
    public List<InventoryClosing> getClosings(@RequestParam String companyId) {
        return inventoryService.getAllClosings(companyId);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/closings/{companyId}/{storageId}/{inventoryId}/{yyyymm}")
    public ResponseEntity<InventoryClosing> getClosing(@PathVariable String companyId, @PathVariable String storageId,
            @PathVariable String inventoryId, @PathVariable String yyyymm) {
        return inventoryService.getClosingById(companyId, storageId, inventoryId, yyyymm)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @DeleteMapping("/closings/{companyId}/{storageId}/{inventoryId}/{yyyymm}")
    public ResponseEntity<Void> deleteClosing(@PathVariable String companyId, @PathVariable String storageId,
            @PathVariable String inventoryId, @PathVariable String yyyymm) {
        inventoryService.deleteClosing(companyId, storageId, inventoryId, yyyymm);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("principal.startsWith(#request.companyId)")
    @PostMapping("/transactions")
    public ResponseEntity<Void> processTransaction(@RequestBody com.cmms.dto.InventoryTransactionRequest request) {
        inventoryService.processTransaction(request);
        return ResponseEntity.ok().build();
    }
}
