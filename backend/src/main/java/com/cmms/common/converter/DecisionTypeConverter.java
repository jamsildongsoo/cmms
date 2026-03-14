package com.cmms.common.converter;

import com.cmms.common.domain.DecisionType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class DecisionTypeConverter implements AttributeConverter<DecisionType, String> {

    @Override
    public String convertToDatabaseColumn(DecisionType type) {
        return type != null ? type.getCode() : null;
    }

    @Override
    public DecisionType convertToEntityAttribute(String code) {
        return DecisionType.fromCode(code);
    }
}
