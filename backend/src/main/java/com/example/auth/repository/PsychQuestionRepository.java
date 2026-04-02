package com.example.auth.repository;

import com.example.auth.model.PsychQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PsychQuestionRepository extends JpaRepository<PsychQuestion, Long> {
    List<PsychQuestion> findAllByOrderBySortOrderAsc();
}
