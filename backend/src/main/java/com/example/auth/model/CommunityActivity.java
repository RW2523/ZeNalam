package com.example.auth.model;

import jakarta.persistence.*;

@Entity
@Table(name = "community_activities")
public class CommunityActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String displayName;

    @Column(nullable = false, length = 200)
    private String activityDescription;

    @Column(nullable = false, length = 80)
    private String timeLabel;

    @Column(nullable = false, length = 1000)
    private String imageUrl;

    @Column(nullable = false)
    private int sortOrder;

    public CommunityActivity() {}

    public CommunityActivity(String displayName, String activityDescription, String timeLabel,
                             String imageUrl, int sortOrder) {
        this.displayName = displayName;
        this.activityDescription = activityDescription;
        this.timeLabel = timeLabel;
        this.imageUrl = imageUrl;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getActivityDescription() { return activityDescription; }
    public void setActivityDescription(String activityDescription) { this.activityDescription = activityDescription; }
    public String getTimeLabel() { return timeLabel; }
    public void setTimeLabel(String timeLabel) { this.timeLabel = timeLabel; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
