package com.cmms.service;

import com.cmms.domain.Person;
import com.cmms.domain.PersonId;
import com.cmms.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final PersonRepository personRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Transactional
    public Optional<Person> login(String companyId, String personId, String password) {
        log.info("Attempting login - Company ID: [{}], Person ID: [{}], Password: [{}]", companyId, personId, password);
        log.info("Valid Bcrypt for 1234: {}", passwordEncoder.encode("1234"));

        Optional<Person> personOpt = personRepository.findById(new PersonId(companyId, personId));

        if (personOpt.isPresent()) {
            Person person = personOpt.get();
            String storedHash = person.getPasswordHash();
            log.info("Found person: [{}], Stored Hash: [{}]", person.getName(), storedHash);

            boolean isMatch = false;
            if (storedHash != null) {
                isMatch = passwordEncoder.matches(password, storedHash);
                log.info("Password Match Result: {}", isMatch);
            } else {
                log.warn("Stored hash is null for user [{}]", personId);
            }

            // Validate password against hashed password
            if (isMatch) {
                log.info("Login successful for user [{}]", personId);
                // Update Login Info
                person.setLastLoginAt(java.time.LocalDateTime.now());
                person.setLastLoginIp("127.0.0.1"); // Placeholder, in real app get from Request

                return Optional.of(person);
            } else {
                log.warn("Login failed for user [{}]: Password mismatch", personId);
            }
        } else {
            log.warn("Login failed: Person not found for Company ID [{}] and Person ID [{}]", companyId, personId);
        }
        return Optional.empty();
    }
}
