package com.example.auth.model;

import jakarta.persistence.*;

@Entity
@Table(name = "yoga_poses")
public class YogaPose {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private int sortOrder;

    public YogaPose() {}

    public YogaPose(String title, String imageUrl, String description, int sortOrder) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.description = description;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
