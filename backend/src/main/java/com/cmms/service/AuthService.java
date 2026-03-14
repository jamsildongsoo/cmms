package com.cmms.service;

import com.cmms.domain.Person;
import com.cmms.domain.PersonId;
import com.cmms.domain.RefreshToken;
import com.cmms.repository.PersonRepository;
import com.cmms.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import com.cmms.dto.LoginResult;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final PersonRepository personRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Value("${jwt.refresh-expiration:604800000}") // Default 7 days
    private long refreshExpiration;

    // Brute-force 방어: IP별 로그인 시도 추적
    // ⚠ 인메모리 방식 — 다중 인스턴스 배포 시 Redis 등 외부 저장소로 전환 필요
    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MS = 300_000; // 5분
    private final ConcurrentHashMap<String, LoginAttempt> loginAttempts = new ConcurrentHashMap<>();

    @Transactional
    public Optional<LoginResult> login(String companyId, String personId, String password, String clientIp) {
        // Brute-force 체크
        if (isBlocked(clientIp)) {
            log.warn("[AUTH] 로그인 차단 - IP: {}, 사유: 연속 실패 초과", clientIp);
            return Optional.empty();
        }

        Optional<Person> personOpt = personRepository.findById(new PersonId(companyId, personId));

        if (personOpt.isPresent()) {
            Person person = personOpt.get();
            String storedHash = person.getPasswordHash();

            boolean isMatch = false;
            if (storedHash != null) {
                isMatch = passwordEncoder.matches(password, storedHash);
            }

            if (isMatch) {
                // 성공 시 실패 카운터 초기화
                loginAttempts.remove(clientIp);

                LocalDateTime prevLoginAt = person.getLastLoginAt();
                String prevLoginIp = person.getLastLoginIp();

                person.setLastLoginAt(LocalDateTime.now());
                person.setLastLoginIp(clientIp);

                String refreshToken = createRefreshToken(companyId, personId);

                log.info("[AUTH] 로그인 성공 - company: {}, person: {}, IP: {}", companyId, personId, clientIp);
                return Optional.of(new LoginResult(person, prevLoginAt, prevLoginIp, refreshToken));
            }
        }

        // 실패 처리
        recordFailedAttempt(clientIp);
        log.warn("[AUTH] 로그인 실패 - company: {}, person: {}, IP: {}", companyId, personId, clientIp);
        return Optional.empty();
    }

    @Transactional
    public String createRefreshToken(String companyId, String personId) {
        // Delete existing refresh token for rotation
        refreshTokenRepository.deleteByCompanyIdAndPersonId(companyId, personId);

        String tokenValue = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .companyId(companyId)
                .personId(personId)
                .tokenValue(tokenValue)
                .expiryDate(LocalDateTime.now().plus(Duration.ofMillis(refreshExpiration)))
                .build();

        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }

    @Transactional
    public Optional<LoginResult> refreshToken(String tokenValue) {
        return refreshTokenRepository.findByTokenValue(tokenValue)
                .filter(token -> !token.isExpired())
                .flatMap(token -> {
                    String companyId = token.getCompanyId();
                    String personId = token.getPersonId();

                    Optional<Person> personOpt = personRepository.findById(new PersonId(companyId, personId));
                    if (personOpt.isPresent()) {
                        // Rotate refresh token
                        String newTokenValue = createRefreshToken(companyId, personId);
                        return Optional.of(new LoginResult(personOpt.get(), null, null, newTokenValue));
                    }
                    return Optional.empty();
                });
    }

    @Transactional
    public void logout(String companyId, String personId) {
        refreshTokenRepository.deleteByCompanyIdAndPersonId(companyId, personId);
    }

    @Transactional
    public void updateLastLoginPlantId(String companyId, String personId, String plantId) {
        Optional<Person> personOpt = personRepository.findById(new PersonId(companyId, personId));
        if (personOpt.isPresent()) {
            Person person = personOpt.get();
            person.setLastLoginPlantId(plantId);
        }
    }

    // --- Brute-force 방어 로직 ---

    private boolean isBlocked(String ip) {
        LoginAttempt attempt = loginAttempts.get(ip);
        if (attempt == null) return false;
        if (attempt.attempts.get() >= MAX_ATTEMPTS) {
            if (System.currentTimeMillis() - attempt.lastAttemptMs < LOCK_DURATION_MS) {
                return true;
            }
            // 잠금 시간 경과 → 초기화
            loginAttempts.remove(ip);
            return false;
        }
        return false;
    }

    private void recordFailedAttempt(String ip) {
        loginAttempts.compute(ip, (key, existing) -> {
            if (existing == null) {
                return new LoginAttempt();
            }
            existing.attempts.incrementAndGet();
            existing.lastAttemptMs = System.currentTimeMillis();
            return existing;
        });
    }

    /**
     * 잠금 시간이 경과한 loginAttempts 항목을 정리한다.
     * ScheduledTasks에서 주기적으로 호출.
     */
    public void cleanupExpiredAttempts() {
        long now = System.currentTimeMillis();
        int before = loginAttempts.size();
        loginAttempts.entrySet().removeIf(entry ->
                now - entry.getValue().lastAttemptMs >= LOCK_DURATION_MS);
        int removed = before - loginAttempts.size();
        if (removed > 0) {
            log.debug("[AUTH] 만료된 loginAttempts 정리: {}건 제거, 잔여 {}건", removed, loginAttempts.size());
        }
    }

    private static class LoginAttempt {
        final AtomicInteger attempts = new AtomicInteger(1);
        volatile long lastAttemptMs = System.currentTimeMillis();
    }
}
