package com.example.auth.controller;

import com.example.auth.model.*;
import com.example.auth.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/content")
public class ContentController {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Autowired private WellnessQuoteRepository wellnessQuoteRepository;
    @Autowired private ConsultantRepository consultantRepository;
    @Autowired private PsychQuestionRepository psychQuestionRepository;
    @Autowired private YogaPoseRepository yogaPoseRepository;
    @Autowired private ReferenceDataRepository referenceDataRepository;
    @Autowired private CommunityActivityRepository communityActivityRepository;

    @GetMapping("/quotes")
    public List<Map<String, Object>> quotes() {
        return wellnessQuoteRepository.findAllByOrderBySortOrderAsc().stream()
                .map(q -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", q.getId());
                    m.put("text", q.getQuoteText());
                    m.put("type", q.getCategoryType());
                    return m;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/consultants")
    public List<Consultant> consultants() {
        return consultantRepository.findAllByOrderByIdAsc();
    }

    @GetMapping("/psych-questions")
    public List<String> psychQuestions() {
        return psychQuestionRepository.findAllByOrderBySortOrderAsc().stream()
                .map(PsychQuestion::getQuestionText)
                .collect(Collectors.toList());
    }

    @GetMapping("/yoga-poses")
    public List<YogaPose> yogaPoses() {
        return yogaPoseRepository.findAllByOrderBySortOrderAsc();
    }

    @GetMapping("/community-feed")
    public List<CommunityActivity> communityFeed() {
        return communityActivityRepository.findAllByOrderBySortOrderAsc();
    }

    @GetMapping("/reference/sleep-prediction-form")
    public Map<String, Object> sleepPredictionForm() {
        ReferenceData ref = referenceDataRepository.findById("sleep_prediction_form")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reference data not loaded"));
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = MAPPER.readValue(ref.getJsonPayload(), Map.class);
            return parsed;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid reference JSON");
        }
    }
}
