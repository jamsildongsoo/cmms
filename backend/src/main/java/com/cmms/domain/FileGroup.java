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
@Table(name = "file_group")
@IdClass(FileGroupId.class)
public class FileGroup extends BaseEntity {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "file_group_id", length = 100, nullable = false)
    private String fileGroupId;

    @Column(name = "ref_entity", length = 20)
    private String refEntity;

    @Column(name = "ref_id", length = 20)
    private String refId;
}
