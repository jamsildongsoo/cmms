package com.cmms.common.converter;

import com.cmms.common.domain.StepResult;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class StepResultConverter implements AttributeConverter<StepResult, String> {

    @Override
    public String convertToDatabaseColumn(StepResult result) {
        return result != null ? result.getCode() : null;
    }

    @Override
    public StepResult convertToEntityAttribute(String code) {
        return StepResult.fromCode(code);
    }
}
