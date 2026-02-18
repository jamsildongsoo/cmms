package com.cmms.controller;

import com.cmms.domain.Memo;
import com.cmms.service.MemoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memo")
@RequiredArgsConstructor
public class MemoController {

    private final MemoService memoService;

    @PostMapping
    public Memo createMemo(@RequestBody Memo memo) {
        return memoService.saveMemo(memo);
    }

    @GetMapping
    public List<Memo> getMemos(@RequestParam String companyId) {
        return memoService.getMemos(companyId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Memo> getMemo(@PathVariable String id, @RequestParam String companyId) {
        return memoService.getMemoById(companyId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
