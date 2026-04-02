package com.example.auth.controller;

import com.example.auth.model.MealLog;
import com.example.auth.model.User;
import com.example.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${ml.service.url:http://localhost:5002}")
    private String mlServiceUrl;

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        Map<String, Object> result = authService.register(user);
        if ("User already exists".equalsIgnoreCase(String.valueOf(result.get("message")))) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        Map<String, Object> result = authService.login(
                loginData.get("email"),
                loginData.get("password"));
        if ("Invalid credentials".equalsIgnoreCase(String.valueOf(result.get("message")))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
        }
        return ResponseEntity.ok(result);
    }

    static class InputData {
        public List<Double> features;
    }

    @PostMapping("/trigger-ml")
    public ResponseEntity<?> triggerModel(@RequestBody InputData input) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String mlUrl = mlServiceUrl + "/predict";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<InputData> request = new HttpEntity<>(input, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(mlUrl, request, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error contacting ML service: " + e.getMessage());
        }
    }

    @PostMapping("/pred")
    public Map<String, String> pred(@RequestBody Map<String, Object> inputData) {
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            Object raw = inputData == null ? null : inputData.get("payload");
            if (!(raw instanceof Map)) {
                return Map.of("error", "Missing or invalid payload. Expected { \"payload\": { \"features\": [...] } }.");
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = (Map<String, Object>) raw;

            RestTemplate restTemplate = new RestTemplate();
            String mlUrl = mlServiceUrl + "/predict";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(mlUrl, request, String.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = objectMapper.readValue(response.getBody(), Map.class);
            if (responseBody.get("error") != null) {
                return Map.of("error", String.valueOf(responseBody.get("error")));
            }
            Object predObj = responseBody.get("prediction");
            if (!(predObj instanceof List) || ((List<?>) predObj).isEmpty()) {
                return Map.of("error", "Unexpected response from sleep model (no prediction).");
            }
            Object prediction = ((List<?>) predObj).get(0);
            return Map.of("prediction", prediction.toString());

        } catch (HttpStatusCodeException e) {
            String detail = extractMlErrorJson(objectMapper, e.getResponseBodyAsString(), e.getMessage());
            return Map.of("error", detail);
        } catch (Exception e) {
            e.printStackTrace();
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return Map.of("error", "ML service error: " + msg
                    + ". Is the Python server running on " + mlServiceUrl + "?");
        }
    }

    private static String extractMlErrorJson(ObjectMapper objectMapper, String body, String fallback) {
        if (body == null || body.isBlank()) {
            return fallback;
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> m = objectMapper.readValue(body, Map.class);
            if (m.get("error") != null) {
                return String.valueOf(m.get("error"));
            }
        } catch (Exception ignored) {
            /* not JSON */
        }
        return body.length() > 280 ? fallback : body;
    }

    @PostMapping("/meals")
    public Map<String, String> meals(@RequestBody MealLog inputData) {
        try {
            authService.saveMealLog(inputData);
            return Map.of("message", "Added meals successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "MEAL service error: " + e.getMessage());
        }
    }

    @GetMapping("/mealslog")
    public ResponseEntity<Map<String, Object>> getMeals(@RequestParam(name = "userId", required = false) Long userId) {
        try {
            List<MealLog> mealLogs = authService.getMealLogsForUser(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("result", "ok");
            response.put("mealLogs", mealLogs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "MEAL service error: " + e.getMessage()));
        }
    }

    @PostMapping("/food")
    public ResponseEntity<Map<String, String>> uploadFoodImage(@RequestParam(value = "image", required = false) MultipartFile image) {
        ObjectMapper objectMapper = new ObjectMapper();
        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No image file provided (field name: image)."));
        }
        try {
            String mlUrl = mlServiceUrl + "/food";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            final String uploadName = (image.getOriginalFilename() == null || image.getOriginalFilename().isBlank())
                    ? "meal.jpg"
                    : image.getOriginalFilename();

            ByteArrayResource resource = new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return uploadName;
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", resource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> flaskResponse = restTemplate.postForEntity(mlUrl, requestEntity, String.class);

            @SuppressWarnings("unchecked")
            Map<String, Object> rawMap = objectMapper.readValue(flaskResponse.getBody(), Map.class);

            if (rawMap.containsKey("error")) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("error", String.valueOf(rawMap.get("error"))));
            }

            Map<String, String> result = new HashMap<>();
            for (Map.Entry<String, Object> entry : rawMap.entrySet()) {
                result.put(entry.getKey(), entry.getValue().toString());
            }

            return ResponseEntity.ok(result);

        } catch (HttpStatusCodeException e) {
            String detail = extractMlErrorJson(objectMapper, e.getResponseBodyAsString(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error", detail));
        } catch (Exception e) {
            e.printStackTrace();
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Food model request failed: " + msg
                            + ". Ensure Python ML is running at " + mlServiceUrl));
        }
    }
}
