package com.cmms.repository;

import com.cmms.domain.Bin;
import com.cmms.domain.BinId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BinRepository extends JpaRepository<Bin, BinId> {
}
