package com.cmms.controller;

import com.cmms.domain.Person;
import com.cmms.dto.LoginRequest;
import com.cmms.dto.JwtResponse;
import com.cmms.service.AuthService;
import com.cmms.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
        Optional<Person> personOpt = authService.login(request.getCompanyId(), request.getPersonId(),
                request.getPassword());

        if (personOpt.isPresent()) {
            Person person = personOpt.get();
            String token = tokenProvider.createToken(person.getCompanyId(), person.getPersonId());
            return ResponseEntity.ok(new JwtResponse(token, person));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
