package com.cmms.common.converter;

import com.cmms.common.domain.CommonStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CommonStatusConverter implements AttributeConverter<CommonStatus, String> {

    @Override
    public String convertToDatabaseColumn(CommonStatus status) {
        return status != null ? status.getCode() : null;
    }

    @Override
    public CommonStatus convertToEntityAttribute(String code) {
        return CommonStatus.fromCode(code);
    }
}
