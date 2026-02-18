package com.cmms.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    private String companyId;
    private String personId;
    private String password;
}
