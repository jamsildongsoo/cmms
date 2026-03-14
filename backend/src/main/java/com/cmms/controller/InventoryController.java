package com.cmms.controller;

import com.cmms.common.security.SecurityUtil;
import com.cmms.domain.*;
import com.cmms.dto.InventoryStockDto;
import com.cmms.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inv")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/stock")
    public List<InventoryStockDto> getStock(Authentication auth) {
        return inventoryService.getStockStatus(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/history")
    public List<InventoryHistory> getHistory(Authentication auth) {
        return inventoryService.getAllHistories(SecurityUtil.getCompanyId(auth));
    }

    @PostMapping("/transactions")
    public ResponseEntity<Void> processTransaction(@RequestBody com.cmms.dto.InventoryTransactionRequest request, Authentication auth) {
        request.setCompanyId(SecurityUtil.getCompanyId(auth));
        inventoryService.processTransaction(request);
        return ResponseEntity.ok().build();
    }
}
