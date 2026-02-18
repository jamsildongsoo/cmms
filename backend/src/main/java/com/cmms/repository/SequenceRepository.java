package com.cmms.repository;

import com.cmms.domain.Sequence;
import com.cmms.domain.SequenceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SequenceRepository extends JpaRepository<Sequence, SequenceId> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    java.util.Optional<Sequence> findByCompanyIdAndRefEntityAndDateKey(String companyId, String refEntity,
            String dateKey);
}
