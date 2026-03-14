package com.cmms.domain;

import com.cmms.common.domain.BaseEntity;
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
@Table(name = "bin")
@IdClass(BinId.class)
public class Bin extends BaseEntity {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "bin_id", length = 20, nullable = false)
    private String binId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "storage_id", length = 20, nullable = false)
    private String storageId;
}
