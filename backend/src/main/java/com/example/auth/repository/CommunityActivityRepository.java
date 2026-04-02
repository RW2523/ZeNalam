package com.example.auth.repository;

import com.example.auth.model.CommunityActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityActivityRepository extends JpaRepository<CommunityActivity, Long> {
    List<CommunityActivity> findAllByOrderBySortOrderAsc();
}
