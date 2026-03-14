package com.cmms.common.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum CommonStatus {
    TEMPORARY("T", "임시"),
    APPROVAL("A", "결재중"),
    CONFIRMED("C", "완료"),
    REJECTED("R", "반려"),
    CANCELED("X", "취소");

    private final String code;
    private final String label;

    CommonStatus(String code, String label) {
        this.code = code;
        this.label = label;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static CommonStatus fromCode(String code) {
        if (code == null) return null;
        for (CommonStatus status : CommonStatus.values()) {
            if (status.getCode().equals(code)) return status;
        }
        return null;
    }
}
