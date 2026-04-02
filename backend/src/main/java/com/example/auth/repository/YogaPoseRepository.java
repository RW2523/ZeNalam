package com.example.auth.repository;

import com.example.auth.model.YogaPose;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface YogaPoseRepository extends JpaRepository<YogaPose, Long> {
    List<YogaPose> findAllByOrderBySortOrderAsc();
}
