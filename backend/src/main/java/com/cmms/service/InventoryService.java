package com.cmms.service;

import com.cmms.domain.*;
import com.cmms.dto.InventoryStockDto;
import com.cmms.dto.InventoryTransactionRequest;
import com.cmms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryService {

    private final InventoryStockRepository stockRepository;
    private final InventoryHistoryRepository historyRepository;
    private final InventoryRepository inventoryRepository;
    private final StorageRepository storageRepository;
    private final BinRepository binRepository;
    private final LocationRepository locationRepository;
    private final SystemService systemService;

    /**
     * 재고 현황: inventory LEFT JOIN inventory_stock + name enrichment
     */
    public List<InventoryStockDto> getStockStatus(String companyId) {
        List<Inventory> allItems = inventoryRepository.findAllByCompanyIdAndDeleteMark(companyId, "N");
        List<InventoryStock> allStocks = stockRepository.findByCompanyIdOrderByInventoryIdAscStorageIdAsc(companyId);

        // Name maps for enrichment
        Map<String, String> storageNames = storageRepository.findAllByCompanyIdAndDeleteMark(companyId, "N")
                .stream().collect(Collectors.toMap(Storage::getStorageId, Storage::getName, (a, b) -> a));
        Map<String, String> binNames = binRepository.findAllByCompanyId(companyId)
                .stream().collect(Collectors.toMap(Bin::getBinId, Bin::getName, (a, b) -> a));
        Map<String, String> locationNames = locationRepository.findAllByCompanyId(companyId)
                .stream().collect(Collectors.toMap(Location::getLocationId, Location::getName, (a, b) -> a));

        Map<String, Inventory> itemMap = allItems.stream()
                .collect(Collectors.toMap(Inventory::getInventoryId, Function.identity(), (a, b) -> a));

        // Stock이 있는 inventoryId 추적
        Set<String> hasStock = new HashSet<>();
        List<InventoryStockDto> result = new ArrayList<>();

        for (InventoryStock stock : allStocks) {
            hasStock.add(stock.getInventoryId());
            Inventory inv = itemMap.get(stock.getInventoryId());
            result.add(InventoryStockDto.builder()
                    .inventoryId(stock.getInventoryId())
                    .name(inv != null ? inv.getName() : stock.getInventoryId())
                    .spec(inv != null ? inv.getSpec() : null)
                    .unit(inv != null ? inv.getUnit() : null)
                    .codeItem(inv != null ? inv.getCodeItem() : null)
                    .storageId(stock.getStorageId())
                    .storageName(storageNames.getOrDefault(stock.getStorageId(), stock.getStorageId()))
                    .binId(stock.getBinId())
                    .binName(binNames.get(stock.getBinId()))
                    .locationId(stock.getLocationId())
                    .locationName(locationNames.get(stock.getLocationId()))
                    .qty(stock.getQty())
                    .amount(stock.getAmount())
                    .build());
        }

        // Stock이 없는 자재 → qty=0, amount=0
        for (Inventory inv : allItems) {
            if (!hasStock.contains(inv.getInventoryId())) {
                result.add(InventoryStockDto.builder()
                        .inventoryId(inv.getInventoryId())
                        .name(inv.getName())
                        .spec(inv.getSpec())
                        .unit(inv.getUnit())
                        .codeItem(inv.getCodeItem())
                        .qty(BigDecimal.ZERO)
                        .amount(BigDecimal.ZERO)
                        .build());
            }
        }

        return result;
    }

    public List<InventoryHistory> getAllHistories(String companyId) {
        return historyRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
    }

    @Transactional
    public void processTransaction(InventoryTransactionRequest request) {
        String type = request.getType();
        // 트랜잭션 단위 historyId 채번 (MOVE는 OUT/IN 별도)
        String historyId = systemService.generateId(request.getCompanyId(), "INV_HISTORY", "GLOBAL");
        String moveInHistoryId = "MOVE".equals(type)
                ? systemService.generateId(request.getCompanyId(), "INV_HISTORY", "GLOBAL") : null;

        for (InventoryTransactionRequest.TransactionItem item : request.getItems()) {
            String binId = item.getBinId();
            String locId = item.getLocationId();
            BigDecimal qty = item.getQty() != null ? item.getQty() : BigDecimal.ZERO;

            if ("IN".equals(type)) {
                processIn(request, item, binId, locId, qty, historyId);
            } else if ("OUT".equals(type)) {
                processOut(request, item, binId, locId, qty, historyId);
            } else if ("MOVE".equals(type)) {
                processMove(request, item, binId, locId, qty, historyId, moveInHistoryId);
            } else if ("ADJUST".equals(type)) {
                processAdjust(request, item, qty, historyId);
            }
        }
    }

    /**
     * IN: 수량 + 입력된 금액 그대로 저장
     */
    private void processIn(InventoryTransactionRequest request, InventoryTransactionRequest.TransactionItem item,
                           String binId, String locId, BigDecimal qty, String historyId) {
        BigDecimal amount = item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO;

        InventoryStock stock = getOrCreateStock(request.getCompanyId(), item.getStorageId(), binId, locId, item.getInventoryId());
        stock.setQty(stock.getQty().add(qty));
        stock.setAmount(stock.getAmount().add(amount));
        stockRepository.save(stock);

        saveHistory(request.getCompanyId(), item.getStorageId(), binId, locId, item.getInventoryId(),
                historyId, "IN", qty, amount, request.getRefEntity(), request.getRefId());
    }

    /**
     * OUT: 창고 단가 기반 금액 자동 계산
     */
    private void processOut(InventoryTransactionRequest request, InventoryTransactionRequest.TransactionItem item,
                            String binId, String locId, BigDecimal qty, String historyId) {
        InventoryStock stock = getOrCreateStock(request.getCompanyId(), item.getStorageId(), binId, locId, item.getInventoryId());
        if (stock.getQty().compareTo(qty) < 0) {
            throw new IllegalStateException("재고 부족: " + item.getInventoryId()
                    + " (현재: " + stock.getQty() + ", 요청: " + qty + ")");
        }

        BigDecimal unitPrice = getStorageUnitPrice(request.getCompanyId(), item.getStorageId(), item.getInventoryId());
        BigDecimal amount = qty.multiply(unitPrice).setScale(2, RoundingMode.HALF_UP);

        stock.setQty(stock.getQty().subtract(qty));
        stock.setAmount(stock.getAmount().subtract(amount));
        stockRepository.save(stock);

        saveHistory(request.getCompanyId(), item.getStorageId(), binId, locId, item.getInventoryId(),
                historyId, "OUT", qty, amount, request.getRefEntity(), request.getRefId());
    }

    /**
     * MOVE: FROM 창고 단가 기반 금액 계산, TO에 동일 금액 적용
     */
    private void processMove(InventoryTransactionRequest request, InventoryTransactionRequest.TransactionItem item,
                             String binId, String locId, BigDecimal qty, String moveOutHistoryId, String moveInHistoryId) {
        // FROM
        InventoryStock fromStock = getOrCreateStock(request.getCompanyId(), item.getStorageId(), binId, locId, item.getInventoryId());
        if (fromStock.getQty().compareTo(qty) < 0) {
            throw new IllegalStateException("재고 부족 (이동 출고): " + item.getInventoryId()
                    + " (현재: " + fromStock.getQty() + ", 요청: " + qty + ")");
        }

        BigDecimal unitPrice = getStorageUnitPrice(request.getCompanyId(), item.getStorageId(), item.getInventoryId());
        BigDecimal amount = qty.multiply(unitPrice).setScale(2, RoundingMode.HALF_UP);

        fromStock.setQty(fromStock.getQty().subtract(qty));
        fromStock.setAmount(fromStock.getAmount().subtract(amount));
        stockRepository.save(fromStock);

        saveHistory(request.getCompanyId(), item.getStorageId(), binId, locId, item.getInventoryId(),
                moveOutHistoryId, "MOVE_OUT", qty, amount, "MOVE", moveInHistoryId);

        // TO
        String toBinId = item.getToBinId();
        String toLocId = item.getToLocationId();
        String toStorageId = defaultIfBlank(item.getToStorageId(), item.getStorageId());

        InventoryStock toStock = getOrCreateStock(request.getCompanyId(), toStorageId, toBinId, toLocId, item.getInventoryId());
        toStock.setQty(toStock.getQty().add(qty));
        toStock.setAmount(toStock.getAmount().add(amount));
        stockRepository.save(toStock);

        saveHistory(request.getCompanyId(), toStorageId, toBinId, toLocId, item.getInventoryId(),
                moveInHistoryId, "MOVE_IN", qty, amount, "MOVE", moveOutHistoryId);
    }

    /**
     * ADJUST: 실사 수량과 현재 수량의 차이를 창고 단가로 계산
     */
    private void processAdjust(InventoryTransactionRequest request, InventoryTransactionRequest.TransactionItem item,
                               BigDecimal actualQty, String historyId) {
        InventoryStock stock = getOrCreateStock(request.getCompanyId(), item.getStorageId(), item.getBinId(), item.getLocationId(), item.getInventoryId());
        BigDecimal diff = actualQty.subtract(stock.getQty());

        if (diff.compareTo(BigDecimal.ZERO) != 0) {
            BigDecimal unitPrice = getStorageUnitPrice(request.getCompanyId(), item.getStorageId(), item.getInventoryId());
            BigDecimal diffAmount = diff.multiply(unitPrice).setScale(2, RoundingMode.HALF_UP);

            stock.setQty(actualQty);
            stock.setAmount(stock.getAmount().add(diffAmount));
            stockRepository.save(stock);

            String adjType = diff.compareTo(BigDecimal.ZERO) > 0 ? "ADJUST_IN" : "ADJUST_OUT";
            saveHistory(request.getCompanyId(), item.getStorageId(), item.getBinId(), item.getLocationId(), item.getInventoryId(),
                    historyId, adjType, diff.abs(), diffAmount.abs(), request.getRefEntity(), request.getRefId());
        }
    }

    /**
     * 창고 단가 조회: SUM(amount) / SUM(qty)
     * qty가 0이면 단가 0 반환
     */
    private BigDecimal getStorageUnitPrice(String companyId, String storageId, String inventoryId) {
        BigDecimal unitPrice = stockRepository.getStorageUnitPrice(companyId, storageId, inventoryId);
        return unitPrice != null ? unitPrice.setScale(4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
    }

    private InventoryStock getOrCreateStock(String companyId, String storageId, String binId, String locId, String inventoryId) {
        InventoryStockId stockId = new InventoryStockId(companyId, storageId, binId, locId, inventoryId);
        return stockRepository.findById(stockId).orElseGet(() -> {
            InventoryStock s = new InventoryStock();
            s.setCompanyId(companyId);
            s.setStorageId(storageId);
            s.setBinId(binId);
            s.setLocationId(locId);
            s.setInventoryId(inventoryId);
            s.setQty(BigDecimal.ZERO);
            s.setAmount(BigDecimal.ZERO);
            return s;
        });
    }

    private void saveHistory(String companyId, String storageId, String binId, String locId, String inventoryId,
                             String historyId, String txType, BigDecimal qty,
                             BigDecimal amount, String refEntity, String refId) {
        InventoryHistory history = new InventoryHistory();
        history.setCompanyId(companyId);
        history.setStorageId(storageId);
        history.setBinId(binId);
        history.setLocationId(locId);
        history.setInventoryId(inventoryId);
        history.setHistoryId(historyId);
        history.setTxType(txType);
        history.setQty(qty);
        history.setAmount(amount);
        history.setRefEntity(refEntity);
        history.setRefId(refId);
        historyRepository.save(history);
    }

    private String defaultIfBlank(String value, String defaultValue) {
        return value != null && !value.isBlank() ? value : defaultValue;
    }
}
