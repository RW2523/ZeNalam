package com.example.auth.service;

import com.example.auth.model.MealLog;
import com.example.auth.model.User;
import com.example.auth.repository.MealLogRepository;
import com.example.auth.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MealLogRepository mealLogRepository;

    public Map<String, Object> register(User user) {
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            return Map.of("message", "User already exists");
        }
        User saved = userRepository.save(user);
        Map<String, Object> ok = new HashMap<>();
        ok.put("message", "User registered successfully");
        ok.put("userId", saved.getId());
        return ok;
    }

    public Map<String, Object> login(String email, String password) {
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isPresent() && opt.get().getPassword().equals(password)) {
            User u = opt.get();
            Map<String, Object> ok = new HashMap<>();
            ok.put("message", "Login successful");
            ok.put("userId", u.getId());
            ok.put("name", u.getName());
            ok.put("email", u.getEmail());
            return ok;
        }
        return Map.of("message", "Invalid credentials");
    }

    public void saveMealLog(MealLog mealLogDto) {
        MealLog mealLog = new MealLog();
        mealLog.setFoodName(mealLogDto.getFoodName());
        mealLog.setMealType(mealLogDto.getMealType());
        mealLog.setMealTime(mealLogDto.getMealTime());
        mealLog.setQuantityInGrams(mealLogDto.getQuantityInGrams());
        mealLog.setUserId(mealLogDto.getUserId());
        mealLogRepository.save(mealLog);
    }

    public List<MealLog> getMealLogsForUser(Long userId) {
        if (userId == null) {
            return List.of();
        }
        return mealLogRepository.findByUserIdOrderByIdDesc(userId);
    }
}
