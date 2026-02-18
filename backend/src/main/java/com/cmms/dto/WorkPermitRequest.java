package com.cmms.dto;

import com.cmms.domain.WorkPermit;
import com.cmms.domain.WorkPermitItem;
import lombok.Data;
import java.util.List;

@Data
public class WorkPermitRequest {
    private WorkPermit workPermit;
    private List<WorkPermitItem> items;
}
