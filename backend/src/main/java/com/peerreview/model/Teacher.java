package com.peerreview.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("TEACHER")
public class Teacher extends User {
    protected Teacher() { }

    public Teacher(String name, String email, String passwordHash) {
        super(name, email, passwordHash);
    }

    @Override
    public String getRole() { return "TEACHER"; }
}
