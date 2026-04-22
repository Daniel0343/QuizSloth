package com.quizsloth.repository;

import com.quizsloth.model.Curso;
import com.quizsloth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Integer> {

    List<Curso> findByProfesor(Usuario profesor);

    List<Curso> findByNombreContainingIgnoreCase(String nombre);

    List<Curso> findByAlumnosContaining(Usuario alumno);

    @Query("SELECT DISTINCT c FROM Curso c WHERE c.profesor = :u OR :u MEMBER OF c.alumnos")
    List<Curso> findByProfesorOrInvitado(@Param("u") Usuario u);
}
