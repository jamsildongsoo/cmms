package com.cmms.repository;

import com.cmms.domain.RefreshToken;
import com.cmms.domain.RefreshTokenId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, RefreshTokenId> {
    Optional<RefreshToken> findByTokenValue(String tokenValue);
    void deleteByCompanyIdAndPersonId(String companyId, String personId);

    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiryDate < :now")
    int deleteExpiredTokens(LocalDateTime now);
}
