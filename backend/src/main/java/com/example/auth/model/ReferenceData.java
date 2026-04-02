package com.example.auth.model;

import jakarta.persistence.*;

@Entity
@Table(name = "reference_data")
public class ReferenceData {

    @Id
    @Column(length = 80)
    private String dataKey;

    @Lob
    @Column(nullable = false)
    private String jsonPayload;

    public ReferenceData() {}

    public ReferenceData(String dataKey, String jsonPayload) {
        this.dataKey = dataKey;
        this.jsonPayload = jsonPayload;
    }

    public String getDataKey() { return dataKey; }
    public void setDataKey(String dataKey) { this.dataKey = dataKey; }
    public String getJsonPayload() { return jsonPayload; }
    public void setJsonPayload(String jsonPayload) { this.jsonPayload = jsonPayload; }
}
