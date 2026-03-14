package com.cmms.controller;

import com.cmms.common.security.SecurityUtil;
import com.cmms.domain.FileGroup;
import com.cmms.service.FileStorageService;
import com.cmms.service.SystemService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/sys")
@RequiredArgsConstructor
public class SystemController {

    private final FileStorageService fileStorageService;
    private final SystemService systemService;

    @PostMapping("/files/upload")
    public ResponseEntity<FileGroup> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "fileGroupId", required = false) String fileGroupId,
            @RequestParam(value = "refEntity", required = false) String refEntity,
            @RequestParam(value = "refId", required = false) String refId,
            Authentication auth) {
        FileGroup fileGroup = fileStorageService.storeFile(file, SecurityUtil.getCompanyId(auth), fileGroupId, refEntity, refId);
        return ResponseEntity.ok(fileGroup);
    }

    @GetMapping("/files/{fileGroupId}")
    public ResponseEntity<FileGroup> getFileGroup(@PathVariable String fileGroupId, Authentication auth) {
        return systemService.getFileGroupById(SecurityUtil.getCompanyId(auth), fileGroupId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/files/download/{fileItemId}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String fileItemId,
            @RequestParam String fileGroupId,
            @RequestParam Integer lineNo,
            Authentication auth) {
        return systemService.getFileItemById(SecurityUtil.getCompanyId(auth), fileGroupId, lineNo)
                .map(item -> {
                    Resource resource = fileStorageService.loadFileAsResource(item.getStoragePath());
                    String contentType = "application/octet-stream";
                    if (item.getMime() != null)
                        contentType = item.getMime();

                    return ResponseEntity.ok()
                            .contentType(MediaType.parseMediaType(contentType))
                            .header(HttpHeaders.CONTENT_DISPOSITION,
                                    "attachment; filename=\"" + item.getOriginalName() + "\"")
                            .body(resource);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
