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
@Table(name = "sequence")
@IdClass(SequenceId.class)
public class Sequence {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "ref_entity", length = 20, nullable = false)
    private String refEntity;

    @Id
    @Column(name = "date_key", length = 20, nullable = false)
    private String dateKey;

    @Column(name = "next_seq")
    private Long nextSeq;
}
