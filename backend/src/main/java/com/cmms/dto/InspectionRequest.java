package com.cmms.dto;

import com.cmms.domain.Inspection;
import com.cmms.domain.InspectionItem;
import lombok.Data;
import java.util.List;

@Data
public class InspectionRequest {
    private Inspection inspection;
    private List<InspectionItem> items;
}
