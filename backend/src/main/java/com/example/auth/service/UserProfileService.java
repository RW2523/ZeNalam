package com.example.auth.service;

import com.example.auth.model.User;
import com.example.auth.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserProfileService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getUserWithProfile(Long userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Map<String, Object> out = new HashMap<>();
        out.put("id", u.getId());
        out.put("name", u.getName());
        out.put("email", u.getEmail());
        out.put("profile", parseProfile(u.getWellnessProfileJson()));
        return out;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> updateProfile(Long userId, Map<String, Object> updates) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Map<String, Object> existing = parseProfile(u.getWellnessProfileJson());
        if (updates != null) {
            if (updates.containsKey("name") && updates.get("name") != null) {
                u.setName(String.valueOf(updates.get("name")));
            }
            for (Map.Entry<String, Object> e : updates.entrySet()) {
                String k = e.getKey();
                if (k == null || "id".equals(k) || "email".equals(k) || "name".equals(k)) {
                    continue;
                }
                existing.put(k, e.getValue());
            }
        }
        try {
            u.setWellnessProfileJson(MAPPER.writeValueAsString(existing));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid profile data");
        }
        userRepository.save(u);
        return getUserWithProfile(userId);
    }

    private Map<String, Object> parseProfile(String json) {
        if (json == null || json.isBlank()) {
            return new HashMap<>();
        }
        try {
            return MAPPER.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
}
