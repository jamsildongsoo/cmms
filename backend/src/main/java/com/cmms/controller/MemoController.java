package com.cmms.controller;

import com.cmms.domain.Memo;
import com.cmms.service.MemoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memo")
@RequiredArgsConstructor
public class MemoController {

    private final MemoService memoService;

    @PreAuthorize("principal.startsWith(#memo.companyId)")
    @PostMapping
    public Memo createMemo(@RequestBody Memo memo) {
        return memoService.saveMemo(memo);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping
    public List<Memo> getMemos(@RequestParam String companyId) {
        return memoService.getMemos(companyId);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/{id}")
    public ResponseEntity<Memo> getMemo(@PathVariable String id, @RequestParam String companyId) {
        return memoService.getMemoById(companyId, id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMemo(@PathVariable String id, @RequestParam String companyId,
            @RequestParam String personId) {
        memoService.deleteMemo(companyId, id, personId);
        return ResponseEntity.ok().build();
    }

    // Memo Comments
    @PreAuthorize("principal.startsWith(#companyId)")
    @GetMapping("/{id}/comments")
    public List<com.cmms.domain.MemoComment> getComments(@PathVariable String id, @RequestParam String companyId) {
        return memoService.getComments(companyId, id);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @PostMapping("/{id}/comments")
    public com.cmms.domain.MemoComment addComment(
            @PathVariable String id,
            @RequestParam String companyId,
            @RequestBody java.util.Map<String, String> payload) {
        String authorId = payload.get("authorId");
        String content = payload.get("content");
        return memoService.addComment(companyId, id, authorId, content);
    }

    @PreAuthorize("principal.startsWith(#companyId)")
    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String id,
            @PathVariable Integer commentId,
            @RequestParam String companyId,
            @RequestParam String personId) {
        memoService.deleteComment(companyId, id, commentId, personId);
        return ResponseEntity.ok().build();
    }
}
