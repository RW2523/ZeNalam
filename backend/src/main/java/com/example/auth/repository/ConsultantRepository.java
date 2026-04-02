package com.example.auth.repository;

import com.example.auth.model.Consultant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsultantRepository extends JpaRepository<Consultant, Long> {
    List<Consultant> findAllByOrderByIdAsc();
}
