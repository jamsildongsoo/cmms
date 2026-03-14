package com.cmms.service;

import com.cmms.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final AuthService authService;
    private final RefreshTokenRepository refreshTokenRepository;

    /**
     * m1: 만료된 로그인 시도 기록 정리 (5분마다)
     */
    @Scheduled(fixedRate = 300_000)
    public void cleanupLoginAttempts() {
        authService.cleanupExpiredAttempts();
    }

    /**
     * m4: 만료된 refresh token DB 정리 (매일 03:00)
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredRefreshTokens() {
        int deleted = refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        if (deleted > 0) {
            log.info("[SCHEDULED] 만료된 refresh token 정리: {}건 삭제", deleted);
        }
    }
}
