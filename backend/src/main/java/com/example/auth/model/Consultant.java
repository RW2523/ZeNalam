package com.example.auth.model;

import jakarta.persistence.*;

@Entity
@Table(name = "consultants")
public class Consultant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String specialization;

    @Column(nullable = false)
    private String hospital;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String contact;

    @Column(nullable = false, length = 200)
    private String availableHours;

    @Column(nullable = false, length = 1000)
    private String imageUrl;

    public Consultant() {}

    public Consultant(String name, String specialization, String hospital, String location,
                      String contact, String availableHours, String imageUrl) {
        this.name = name;
        this.specialization = specialization;
        this.hospital = hospital;
        this.location = location;
        this.contact = contact;
        this.availableHours = availableHours;
        this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public String getAvailableHours() { return availableHours; }
    public void setAvailableHours(String availableHours) { this.availableHours = availableHours; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
