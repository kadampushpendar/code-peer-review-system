package com.peerreview.repository;

import com.peerreview.model.Student;
import com.peerreview.model.Teacher;
import com.peerreview.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);

    @Query("select s from Student s order by s.name")
    List<Student> findAllStudents();

    @Query("select s from Student s where s.teacher.id = :teacherId order by s.name")
    List<Student> findStudentsByTeacherId(@Param("teacherId") Long teacherId);

    @Query("select t from Teacher t where lower(t.classroomCode) = lower(:classroomCode)")
    Optional<Teacher> findTeacherByClassroomCode(@Param("classroomCode") String classroomCode);
}
