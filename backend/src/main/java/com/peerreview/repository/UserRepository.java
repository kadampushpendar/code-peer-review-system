package com.peerreview.repository;

import com.peerreview.model.Student;
import com.peerreview.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);

    @Query("select s from Student s order by s.name")
    List<Student> findAllStudents();
}
