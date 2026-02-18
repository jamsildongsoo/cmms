package com.cmms.service;

import com.cmms.domain.FileGroup;
import com.cmms.domain.FileItem;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    @Value("${file.upload-dir:c:/cmms/uploads}")
    private String uploadDir;

    private final SystemService systemService;

    public FileGroup storeFile(MultipartFile file, String companyId, String fileGroupId, String refEntity,
            String refId) {
        try {
            // 1. Ensure Directory
            String dateFolder = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            Path storagePath = Paths.get(uploadDir, companyId, dateFolder);
            Files.createDirectories(storagePath);

            // 2. Generate File Group ID if null
            if (fileGroupId == null || fileGroupId.isBlank()) {
                fileGroupId = systemService.generateId(companyId, "FILE_GROUP",
                        LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")));
            }

            // 3. Create File Group Entity if needed
            FileGroup fileGroup = systemService.getFileGroupById(companyId, fileGroupId).orElse(null);
            if (fileGroup == null) {
                fileGroup = new FileGroup();
                fileGroup.setCompanyId(companyId);
                fileGroup.setFileGroupId(fileGroupId);
                fileGroup.setRefEntity(refEntity);
                fileGroup.setRefId(refId);
                systemService.saveFileGroup(fileGroup);
            }

            // 4. Generate Unique Filename & Save
            String originalFilename = file.getOriginalFilename();
            String ext = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                ext = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
            }
            String storedName = UUID.randomUUID().toString() + (ext.isEmpty() ? "" : "." + ext);
            Path targetPath = storagePath.resolve(storedName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            // 5. Calculate Line No (Max + 1) -> Simplification: SystemService doesn't have
            // maxLineNo yet.
            // For now, we fetch all items or just rely on a separate query.
            // Ideally SystemService should have `getNextFileItemLineNo(companyId,
            // fileGroupId)`.
            // I'll add a simple logic here or assume checking count.
            // Since I cannot modify SystemService repository easily in this step, I'll use
            // a pragmatic approach:
            // Just use current millis or random for now, OR better, let's assume we
            // implement count later.
            // Actually, `SystemService` `saveFileItem` is generic.
            // Let's implement a quick check in SystemService later. For now I'll default to
            // 1 and assume user handles it or I fix it.
            // Better: use count of items + 1. `fileItemRepository` is in SystemService.
            // I will add `getNextFileItemLineNo` to SystemService.

            // 6. Save File Item
            int lineNo = systemService.getNextFileItemLineNo(companyId, fileGroupId);

            FileItem item = new FileItem();
            item.setCompanyId(companyId);
            item.setFileGroupId(fileGroupId);
            item.setLineNo(lineNo); // TODO: Fix this
            item.setOriginalName(originalFilename);
            item.setStoredName(storedName);
            item.setExt(ext);
            item.setMime(file.getContentType());
            item.setSize(file.getSize());
            item.setStoragePath(targetPath.toAbsolutePath().toString());

            // Re-use logic to get max line no if possible, or catch constraint violation
            // and retry? No.
            // I will updated SystemService to support line no generation.

            systemService.saveFileItem(item);

            return fileGroup;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    public Resource loadFileAsResource(String fullPath) {
        try {
            Path filePath = Paths.get(fullPath);
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fullPath);
            }
        } catch (Exception e) {
            throw new RuntimeException("File not found " + fullPath, e);
        }
    }
}
