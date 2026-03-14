package com.cmms.common.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum StepResult {
    PENDING("P", "미결"),
    APPROVED("Y", "승인"),
    REJECTED("N", "반려");

    private final String code;
    private final String label;

    StepResult(String code, String label) {
        this.code = code;
        this.label = label;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static StepResult fromCode(String code) {
        if (code == null) return null;
        for (StepResult result : StepResult.values()) {
            if (result.getCode().equals(code)) return result;
        }
        return null;
    }
}
