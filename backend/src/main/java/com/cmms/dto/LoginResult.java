package com.cmms.dto;

import com.cmms.domain.Person;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class LoginResult {
    private Person person;
    private LocalDateTime previousLoginAt;
    private String previousLoginIp;
}
