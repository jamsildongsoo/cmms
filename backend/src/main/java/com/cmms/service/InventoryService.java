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
public class InventoryService {

    private final InventoryStockRepository stockRepository;
    private final InventoryHistoryRepository historyRepository;
    private final InventoryClosingRepository closingRepository;

    @Transactional
    public InventoryStock saveStock(InventoryStock stock) {
        return stockRepository.save(stock);
    }

    public List<InventoryStock> getAllStocks() {
        return stockRepository.findAll();
    }

    public Optional<InventoryStock> getStockById(String companyId, String storageId, String inventoryId) {
        return stockRepository.findById(new InventoryStockId(companyId, storageId, inventoryId));
    }

    @Transactional
    public void deleteStock(String companyId, String storageId, String inventoryId) {
        stockRepository.deleteById(new InventoryStockId(companyId, storageId, inventoryId));
    }

    @Transactional
    public InventoryHistory saveHistory(InventoryHistory history) {
        return historyRepository.save(history);
    }

    public List<InventoryHistory> getAllHistories() {
        return historyRepository.findAll();
    }

    public Optional<InventoryHistory> getHistoryById(String companyId, String storageId, String inventoryId,
            String historyId) {
        return historyRepository.findById(new InventoryHistoryId(companyId, storageId, inventoryId, historyId));
    }

    @Transactional
    public void deleteHistory(String companyId, String storageId, String inventoryId, String historyId) {
        historyRepository.deleteById(new InventoryHistoryId(companyId, storageId, inventoryId, historyId));
    }

    @Transactional
    public InventoryClosing saveClosing(InventoryClosing closing) {
        return closingRepository.save(closing);
    }

    public List<InventoryClosing> getAllClosings() {
        return closingRepository.findAll();
    }

    public Optional<InventoryClosing> getClosingById(String companyId, String storageId, String inventoryId,
            String yyyymm) {
        return closingRepository.findById(new InventoryClosingId(companyId, storageId, inventoryId, yyyymm));
    }

    @Transactional
    public void deleteClosing(String companyId, String storageId, String inventoryId, String yyyymm) {
        closingRepository.deleteById(new InventoryClosingId(companyId, storageId, inventoryId, yyyymm));
    }

    @Transactional
    public void processTransaction(com.cmms.dto.InventoryTransactionRequest request) {
        for (com.cmms.dto.InventoryTransactionRequest.TransactionItem item : request.getItems()) {
            // 1. Update Stock
            InventoryStockId stockId = new InventoryStockId(request.getCompanyId(), item.getStorageId(),
                    item.getInventoryId());
            InventoryStock stock = stockRepository.findById(stockId)
                    .orElseGet(() -> {
                        InventoryStock newStock = new InventoryStock();
                        newStock.setCompanyId(request.getCompanyId());
                        newStock.setStorageId(item.getStorageId());
                        newStock.setInventoryId(item.getInventoryId());
                        newStock.setQty(java.math.BigDecimal.ZERO);
                        newStock.setAmount(java.math.BigDecimal.ZERO);
                        return newStock;
                    });

            java.math.BigDecimal qty = item.getQty() != null ? item.getQty() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal price = item.getUnitPrice() != null ? item.getUnitPrice() : java.math.BigDecimal.ZERO;
            java.math.BigDecimal amount = qty.multiply(price);

            if ("IN".equals(request.getType())) {
                stock.setQty(stock.getQty().add(qty));
                stock.setAmount(stock.getAmount().add(amount));
            } else if ("OUT".equals(request.getType())) {
                stock.setQty(stock.getQty().subtract(qty));
                stock.setAmount(stock.getAmount().subtract(amount));
            }
            // For MOVE, ADJUST - logic can be added here. For now supporting IN/OUT.

            stockRepository.save(stock);

            // 2. Create History
            InventoryHistory history = new InventoryHistory();
            history.setCompanyId(request.getCompanyId());
            history.setStorageId(item.getStorageId());
            history.setInventoryId(item.getInventoryId());
            // Generate History ID - utilizing timestamp for uniqueness in this scope or
            // SystemService if available.
            // Using timestamp + simplistic random for now to avoid circular dependency
            // injection if SystemService is not yet injected or compatible.
            // Actually SystemService is generally better. Let's see if I have it.
            // I don't see SystemService injected in this class. I should inject it?
            // InventoryService only has Repositories injected currently.
            // I'll leave ID generation to a simple logic for now or inject SystemService.
            // Let's inject SystemService.

            history.setHistoryId("HIST-" + System.currentTimeMillis() + "-" + (int) (Math.random() * 1000));

            history.setTxType(request.getType());
            history.setTxDate(request.getDate() != null ? request.getDate() : java.time.LocalDateTime.now());
            history.setQty(qty);
            history.setAmount(amount);
            history.setRefEntity(request.getRefEntity());
            history.setRefId(request.getRefId());

            historyRepository.save(history);
        }
    }
}
