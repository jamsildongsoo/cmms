package com.cmms.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "inspection_item")
@IdClass(InspectionItemId.class)
public class InspectionItem {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "inspection_id", length = 20, nullable = false)
    private String inspectionId;

    @Id
    @Column(name = "line_no", nullable = false)
    private Integer lineNo;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "method", length = 100)
    private String method;

    @Column(name = "min_val", precision = 18, scale = 4)
    private BigDecimal minVal;

    @Column(name = "max_val", precision = 18, scale = 4)
    private BigDecimal maxVal;

    @Column(name = "std_val", precision = 18, scale = 4)
    private BigDecimal stdVal;

    @Column(name = "unit", length = 20)
    private String unit;

    @Column(name = "result_val", precision = 18, scale = 4)
    private BigDecimal resultVal;
}
