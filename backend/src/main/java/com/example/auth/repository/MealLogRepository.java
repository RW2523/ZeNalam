package com.example.auth.repository;

import com.example.auth.model.MealLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealLogRepository extends JpaRepository<MealLog, Long> {
    List<MealLog> findByUserIdOrderByIdDesc(Long userId);
}
