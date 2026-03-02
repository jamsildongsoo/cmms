package com.cmms.dto;

import com.cmms.domain.Person;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private Person user;
    private LocalDateTime previousLoginAt;
    private String previousLoginIp;

    public JwtResponse(String token, Person user) {
        this.token = token;
        this.user = user;
    }
}
