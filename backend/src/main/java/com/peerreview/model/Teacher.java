package com.peerreview.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import java.security.SecureRandom;

@Entity
@DiscriminatorValue("TEACHER")
public class Teacher extends User {
    private static final char[] CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
    private static final SecureRandom RANDOM = new SecureRandom();

    @Column(name = "classroom_code", unique = true, length = 8)
    private String classroomCode;

    protected Teacher() { }

    public Teacher(String name, String email, String passwordHash) {
        this(name, email, passwordHash, generateClassroomCode());
    }

    public Teacher(String name, String email, String passwordHash, String classroomCode) {
        super(name, email, passwordHash);
        this.classroomCode = classroomCode;
    }

    public static String generateClassroomCode() {
        StringBuilder code = new StringBuilder(8);
        for (int i = 0; i < 8; i++) {
            code.append(CODE_CHARACTERS[RANDOM.nextInt(CODE_CHARACTERS.length)]);
        }
        return code.toString();
    }

    public String getClassroomCode() { return classroomCode; }
    public void assignClassroomCode(String classroomCode) { this.classroomCode = classroomCode; }

    @Override
    public String getRole() { return "TEACHER"; }
}
