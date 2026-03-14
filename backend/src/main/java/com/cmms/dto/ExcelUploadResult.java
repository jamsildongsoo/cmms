package com.cmms.dto;

import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExcelUploadResult {
    private int totalRows;
    private int successCount;
    private int failureCount;
    @Builder.Default
    private List<RowError> errors = new ArrayList<>();

    @Getter
    @Setter
    @AllArgsConstructor
    public static class RowError {
        private int rowNum;
        private String identifier; // ID or Name
        private String message;
    }

    public void addError(int rowNum, String identifier, String message) {
        this.errors.add(new RowError(rowNum, identifier, message));
        this.failureCount++;
    }

    public void incrementSuccess() {
        this.successCount++;
    }
}
