package com.cmms;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BcryptTest {

    @Test
    public void generateHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String currentHash = "$2a$10$wT5HItg62J1VokN3x8K.sO0aK.U6zXo4pYh.R30yP.99K1u9k/P1G";
        System.out.println("CURRENT HASH MATCHES '1234'? " + encoder.matches("1234", currentHash));
        System.out.println("NEW HASH FOR '1234': " + encoder.encode("1234"));
    }
}
