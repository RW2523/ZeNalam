package com.example.auth.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.auth.model.OverviewStat;
import com.example.auth.model.OverviewTotal;
import com.example.auth.model.WorkoutDistribution;
import com.example.auth.repository.ActivityRepository;
import com.example.auth.repository.OverviewStatRepository;
import com.example.auth.repository.OverviewTotalRepository;
import com.example.auth.repository.WorkoutDistributionRepository;

import com.example.auth.model.Activity;

@RestController
@RequestMapping("/api")
public class WellnessController {

    @Autowired private ActivityRepository activityRepo;
    @Autowired private OverviewStatRepository overviewStatRepo;
    @Autowired private OverviewTotalRepository overviewTotalRepo;
    @Autowired private WorkoutDistributionRepository workoutRepo;

    @GetMapping("/activities")
    public List<Activity> getActivities() {
        return activityRepo.findAll();
    }

    @GetMapping("/overviews")
    public Map<String, Object> getOverview() {
        List<OverviewStat> stats = overviewStatRepo.findAll();
        List<OverviewTotal> totals = overviewTotalRepo.findAll();

        Map<String, Object> response = new HashMap<>();

        if (stats.isEmpty()) {
            response.put("months", List.of());
            response.put("steps", List.of());
        } else {
            response.put("months", stats.stream().map(OverviewStat::getMonth).toList());
            response.put("steps", stats.stream().map(OverviewStat::getSteps).toList());
        }

        if (totals.isEmpty()) {
            response.put("timeProgress", 0);
            response.put("stepProgress", 0);
            response.put("targetProgress", 0);
        } else {
            OverviewTotal total = totals.get(0);
            response.put("timeProgress", total.getTimeProgress());
            response.put("stepProgress", total.getStepProgress());
            response.put("targetProgress", total.getTargetProgress());
        }

        return response;
    }

    @GetMapping("/workout-distribution")
    public Map<String, Object> getWorkoutDistribution() {
        List<WorkoutDistribution> data = workoutRepo.findAll();

        Map<String, Object> response = new HashMap<>();
        if (data.isEmpty()) {
            response.put("labels", List.of());
            response.put("values", List.of());
        } else {
            response.put("labels", data.stream().map(WorkoutDistribution::getLabel).collect(Collectors.toList()));
            response.put("values", data.stream().map(WorkoutDistribution::getValue).collect(Collectors.toList()));
        }

        return response;
    }
}
