package com.cmms.domain;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class RefreshTokenId implements Serializable {
    private String companyId;
    private String personId;
}
