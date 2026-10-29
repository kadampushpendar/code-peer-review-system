package com.peerreview.repository;

import com.peerreview.model.CodeSubmission;
import com.peerreview.model.Student;
import com.peerreview.model.Teacher;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:classroom;DB_CLOSE_DELAY=-1;MODE=MySQL",
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
class ClassroomRepositoryTest {
    @Autowired
    private UserRepository users;

    @Autowired
    private SubmissionRepository submissions;

    @Test
    void storesClassroomCodesAndReturnsOnlyStudentsAndSubmissionsForInstructor() {
        Teacher instructor = users.saveAndFlush(new Teacher("Instructor", "teacher@example.edu", "encoded"));
        Teacher otherInstructor = users.saveAndFlush(new Teacher("Other", "other@example.edu", "encoded"));
        Student student = users.saveAndFlush(new Student("Student", "student@example.edu", "encoded", instructor));
        users.saveAndFlush(new Student("Other student", "other-student@example.edu", "encoded", otherInstructor));
        submissions.saveAndFlush(new CodeSubmission(student, "Code", null, "JAVA", "class Main {}"));

        assertTrue(users.findTeacherByClassroomCode(instructor.getClassroomCode().toLowerCase()).isPresent());
        assertEquals(1, users.findStudentsByTeacherId(instructor.getId()).size());
        assertEquals(1, submissions.findByTeacherIdOrderByCreatedAtDesc(instructor.getId()).size());
    }
}
