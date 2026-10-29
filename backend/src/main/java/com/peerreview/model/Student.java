package com.peerreview.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
@DiscriminatorValue("STUDENT")
public class Student extends User {
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    protected Student() { }

    public Student(String name, String email, String passwordHash) {
        this(name, email, passwordHash, null);
    }

    public Student(String name, String email, String passwordHash, Teacher teacher) {
        super(name, email, passwordHash);
        this.teacher = teacher;
    }

    public Teacher getTeacher() { return teacher; }

    @Override
    public String getRole() { return "STUDENT"; }
}
