package com.example.auth.repository;

import com.example.auth.model.ReferenceData;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReferenceDataRepository extends JpaRepository<ReferenceData, String> {
}
