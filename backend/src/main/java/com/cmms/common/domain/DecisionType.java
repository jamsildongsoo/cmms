package com.cmms.common.domain;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum DecisionType {
    DRAFT("00", "기안"),
    APPROVAL("01", "결재"),
    AGREEMENT("02", "합의"),
    NOTICE("03", "참조/통보");

    private final String code;
    private final String label;

    DecisionType(String code, String label) {
        this.code = code;
        this.label = label;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static DecisionType fromCode(String code) {
        if (code == null) return null;
        for (DecisionType type : DecisionType.values()) {
            if (type.getCode().equals(code)) return type;
        }
        return null;
    }
}
