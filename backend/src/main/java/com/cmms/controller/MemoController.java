package com.cmms.controller;

import com.cmms.common.security.SecurityUtil;
import com.cmms.domain.Memo;
import com.cmms.service.MemoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memo")
@RequiredArgsConstructor
public class MemoController {

    private final MemoService memoService;

    @PostMapping
    public Memo createMemo(@RequestBody Memo memo, Authentication auth) {
        memo.setCompanyId(SecurityUtil.getCompanyId(auth));
        return memoService.saveMemo(memo);
    }

    @GetMapping
    public List<Memo> getMemos(Authentication auth) {
        return memoService.getMemos(SecurityUtil.getCompanyId(auth));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Memo> getMemo(@PathVariable String id, Authentication auth) {
        return memoService.getMemoById(SecurityUtil.getCompanyId(auth), id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMemo(@PathVariable String id, Authentication auth) {
        memoService.deleteMemo(SecurityUtil.getCompanyId(auth), id, SecurityUtil.getPersonId(auth));
        return ResponseEntity.ok().build();
    }

    // Memo Comments
    @GetMapping("/{id}/comments")
    public List<com.cmms.domain.MemoComment> getComments(@PathVariable String id, Authentication auth) {
        return memoService.getComments(SecurityUtil.getCompanyId(auth), id);
    }

    @PostMapping("/{id}/comments")
    public com.cmms.domain.MemoComment addComment(
            @PathVariable String id,
            @RequestBody java.util.Map<String, String> payload, Authentication auth) {
        String content = payload.get("content");
        return memoService.addComment(SecurityUtil.getCompanyId(auth), id, SecurityUtil.getPersonId(auth), content);
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String id,
            @PathVariable Integer commentId, Authentication auth) {
        memoService.deleteComment(SecurityUtil.getCompanyId(auth), id, commentId, SecurityUtil.getPersonId(auth));
        return ResponseEntity.ok().build();
    }
}
