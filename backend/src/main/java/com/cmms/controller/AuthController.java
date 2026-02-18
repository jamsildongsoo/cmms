package com.cmms.controller;

import com.cmms.domain.Person;
import com.cmms.dto.LoginRequest;
import com.cmms.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Person> login(@RequestBody LoginRequest request) {
        return authService.login(request.getCompanyId(), request.getPersonId(), request.getPassword())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}
