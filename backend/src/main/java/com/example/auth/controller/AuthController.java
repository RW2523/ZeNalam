package com.example.auth.controller;

import com.example.auth.model.MealLog;
import com.example.auth.model.User;
import com.example.auth.repository.MealLogRepository;
import com.example.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.boot.SpringApplication;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.auth.model.MealLog;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${ml.service.url:http://localhost:5002}")
    private String mlServiceUrl;

    @Autowired
    private AuthService authService;

    @Autowired
    private MealLogRepository repo;

    // @PostMapping("/register")
    // public Map<String, String> register(@RequestBody User user) {
    //     String message = authService.register(user);
    //     return Map.of("message", message);
    // }

    // @PostMapping("/login")
    // public Map<String, String> login(@RequestBody Map<String, String> loginData) {
    //     String message = authService.login(loginData.get("email"), loginData.get("password"));
    //     return Map.of("message", message);
    // }

    @PostMapping("/register")
public ResponseEntity<Map<String, String>> register(@RequestBody User user) {
    String message = authService.register(user);
    if ("User already exists".equalsIgnoreCase(message)) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", message));
    }
    return ResponseEntity.ok(Map.of("message", message));
}

@PostMapping("/login")
public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> loginData) {
    String message = authService.login(loginData.get("email"), loginData.get("password"));
    if ("Invalid credentials".equalsIgnoreCase(message)) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", message));
    }
    return ResponseEntity.ok(Map.of("message", message));
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
        try {
            System.out.println("Input data: " + inputData);
            RestTemplate restTemplate = new RestTemplate();
            String mlUrl = mlServiceUrl + "/predict";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // ObjectMapper mapper = new ObjectMapper();
            // Map<String, Object> parsed = mapper.readValue(inputData, Map.class);

            // System.out.println("Input data: " + parsed);

            // ✅ Default input payload
            // Map<String, Object> payload = Map.of(
            //     "features", List.of("Male", "Doctor", "Normal", "Normal", 25, 7, 3, 3)
            // );

            Map<String, Object> payload = (Map<String, Object>) inputData.get("payload");

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(mlUrl, request, String.class);

            // ✅ Parse response JSON to extract prediction
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> responseBody = objectMapper.readValue(response.getBody(), Map.class);
            Object prediction = ((List<?>) responseBody.get("prediction")).get(0);

            return Map.of("prediction", prediction.toString());

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "ML service error: " + e.getMessage());
        }
        
    }

    @PostMapping("/meals")
    public Map<String, String> meals(@RequestBody MealLog inputData) {
        try {
            System.out.println("Input data: " + inputData.getFoodName() + inputData.getUser_id());
            authService.saveMealLog(inputData);
            return Map.of("message", "Added meals successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "MEAL service error: " + e.getMessage());
        }
    }

    // @PostMapping("/mealslog")
    // public Map<String, String> meals(@RequestBody String id) {
    //     try {
    //         List<MealLog> mealLogs = authService.getAllMealLogs();
    //         return Map.of("result", "mealLogs successfully", "mealLogs", mealLogs.toString());
    //     } catch (Exception e) {
    //         e.printStackTrace();
    //         return Map.of("error", "MEAL service error: " + e.getMessage());
    //     }
    // }

    @PostMapping("/mealslog")
    public ResponseEntity<Map<String, Object>> meals(@RequestBody String id) {
        try {
            List<MealLog> mealLogs = authService.getAllMealLogs();
            Map<String, Object> response = new HashMap<>();
            response.put("result", "mealLogs successfully");
            response.put("mealLogs", mealLogs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "MEAL service error: " + e.getMessage()));
        }
    }

    @PostMapping("/food")
    public ResponseEntity<Map<String, String>> uploadFoodImage(@RequestParam("image") MultipartFile image) {
        try {
        String mlUrl = mlServiceUrl + "/food";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        // Prepare image as ByteArrayResource
        ByteArrayResource resource = new ByteArrayResource(image.getBytes()) {
            @Override
            public String getFilename() {
                return image.getOriginalFilename();
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", resource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> flaskResponse = restTemplate.postForEntity(mlUrl, requestEntity, String.class);

        // Parse JSON string response into a Map<String, Object>
        ObjectMapper objectMapper = new ObjectMapper();
        Map<String, Object> rawMap = objectMapper.readValue(flaskResponse.getBody(), Map.class);

        // Convert values to String format
        Map<String, String> result = new HashMap<>();
        for (Map.Entry<String, Object> entry : rawMap.entrySet()) {
            result.put(entry.getKey(), entry.getValue().toString());
        }

        return ResponseEntity.ok(result);

    } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }

}