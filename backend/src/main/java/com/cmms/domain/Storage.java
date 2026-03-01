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
@Table(name = "storage")
@IdClass(StorageId.class)
public class Storage {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "storage_id", length = 20, nullable = false)
    private String storageId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "delete_mark", length = 1, columnDefinition = "CHAR(1)")
    private String deleteMark = "N";
}
