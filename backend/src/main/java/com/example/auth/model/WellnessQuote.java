package com.example.auth.model;

import jakarta.persistence.*;

@Entity
@Table(name = "wellness_quotes")
public class WellnessQuote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String quoteText;

    @Column(nullable = false, length = 120)
    private String categoryType;

    @Column(nullable = false)
    private int sortOrder;

    public WellnessQuote() {}

    public WellnessQuote(String quoteText, String categoryType, int sortOrder) {
        this.quoteText = quoteText;
        this.categoryType = categoryType;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getQuoteText() { return quoteText; }
    public void setQuoteText(String quoteText) { this.quoteText = quoteText; }
    public String getCategoryType() { return categoryType; }
    public void setCategoryType(String categoryType) { this.categoryType = categoryType; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
