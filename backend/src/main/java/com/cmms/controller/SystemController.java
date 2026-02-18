package com.cmms.controller;

import com.cmms.domain.FileGroup;
import com.cmms.service.FileStorageService;
import com.cmms.service.SystemService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/sys")
@RequiredArgsConstructor
public class SystemController {

    private final FileStorageService fileStorageService;
    private final SystemService systemService;

    @PostMapping("/files/upload")
    public ResponseEntity<FileGroup> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("companyId") String companyId,
            @RequestParam(value = "fileGroupId", required = false) String fileGroupId,
            @RequestParam(value = "refEntity", required = false) String refEntity,
            @RequestParam(value = "refId", required = false) String refId) {

        FileGroup fileGroup = fileStorageService.storeFile(file, companyId, fileGroupId, refEntity, refId);
        return ResponseEntity.ok(fileGroup);
    }

    @GetMapping("/files/{fileGroupId}")
    public ResponseEntity<FileGroup> getFileGroup(
            @PathVariable String fileGroupId,
            @RequestParam String companyId) {
        return systemService.getFileGroupById(companyId, fileGroupId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/files/download/{fileItemId}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String fileItemId, // we might need composite key or just query by ID if unique?
            // FileItemId is (companyId, fileGroupId, lineNo). This generic download might
            // be tricky without all keys.
            // Let's change to use query params for composite key or a specialized path.
            // /download/{companyId}/{fileGroupId}/{lineNo}
            @RequestParam String companyId,
            @RequestParam String fileGroupId,
            @RequestParam Integer lineNo) {

        return systemService.getFileItemById(companyId, fileGroupId, lineNo)
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
