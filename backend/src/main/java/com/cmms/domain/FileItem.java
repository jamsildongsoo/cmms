package com.cmms.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "file_item")
@IdClass(FileItemId.class)
public class FileItem {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "file_group_id", length = 100, nullable = false)
    private String fileGroupId;

    @Id
    @Column(name = "line_no", nullable = false)
    private Integer lineNo;

    @Column(name = "original_name", length = 255)
    private String originalName;

    @Column(name = "stored_name", length = 255)
    private String storedName;

    @Column(name = "ext", length = 10)
    private String ext;

    @Column(name = "mime", length = 100)
    private String mime;

    @Column(name = "size")
    private Long size;

    @Column(name = "checksum_sha256", length = 64)
    private String checksumSha256;

    @Column(name = "storage_path", columnDefinition = "TEXT")
    private String storagePath;
}
