package com.example.auth.model;

import jakarta.persistence.*;

@Entity
@Table(name = "psych_questions")
public class PsychQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String questionText;

    @Column(nullable = false)
    private int sortOrder;

    public PsychQuestion() {}

    public PsychQuestion(String questionText, int sortOrder) {
        this.questionText = questionText;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
