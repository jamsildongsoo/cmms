package com.cmms.service;

import com.cmms.domain.Person;
import com.cmms.domain.PersonId;
import com.cmms.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final PersonRepository personRepository;

    @Transactional
    public Optional<Person> login(String companyId, String personId, String password) {
        // In a real application, you should use PasswordEncoder (e.g., BCrypt).
        // For this implementation, we will check if the password matches directly or
        // compares to the hash.
        // Assuming the DB stores plain text or we are doing simple comparison for now.
        // TODO: Integrate Spring Security / BCrypt if needed.

        Optional<Person> personOpt = personRepository.findById(new PersonId(companyId, personId));

        if (personOpt.isPresent()) {
            Person person = personOpt.get();
            // Simple check: password matches passwordHash (or implement hash check)
            // If passwordHash is null, allow login? No.
            String storedHash = person.getPasswordHash();
            if (storedHash != null && storedHash.equals(password)) {
                // Update Login Info
                person.setLastLoginAt(java.time.LocalDateTime.now());
                person.setLastLoginIp("127.0.0.1"); // Placeholder, in real app get from Request
                // Since this is @Transactional, save is implicit on flush, or we can explicit
                // save.
                // personRepository.save(person); // Not strictly needed in Transactional
                // context but safe.

                return Optional.of(person);
            }
            // If strict hash check is needed:
            // if (passwordEncoder.matches(password, storedHash)) ...
        }
        return Optional.empty();
    }
}
