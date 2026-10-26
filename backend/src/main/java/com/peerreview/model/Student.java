package com.peerreview.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("STUDENT")
public class Student extends User {
    protected Student() { }

    public Student(String name, String email, String passwordHash) {
        super(name, email, passwordHash);
    }

    @Override
    public String getRole() { return "STUDENT"; }
}
