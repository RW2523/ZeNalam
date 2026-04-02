package com.example.auth.repository;

import com.example.auth.model.WellnessQuote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WellnessQuoteRepository extends JpaRepository<WellnessQuote, Long> {
    List<WellnessQuote> findAllByOrderBySortOrderAsc();
}
