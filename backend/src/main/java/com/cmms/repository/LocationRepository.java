package com.cmms.repository;

import com.cmms.domain.Location;
import com.cmms.domain.LocationId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, LocationId> {
}
