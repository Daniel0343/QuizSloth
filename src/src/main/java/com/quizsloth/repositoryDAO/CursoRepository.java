package com.quizsloth.repositoryDAO;

import com.quizsloth.model.Curso;
import com.quizsloth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Integer> {

    // Cursos donde el usuario es el profesor principal
    List<Curso> findByProfesor(Usuario profesor);

    // Cursos cuyo nombre contiene la cadena indicada (sin distinguir mayúsculas)
    List<Curso> findByNombreContainingIgnoreCase(String nombre);

    // Cursos en los que el usuario está inscrito como alumno
    List<Curso> findByAlumnosContaining(Usuario alumno);

    // Cursos en los que el usuario es profesor principal o está en la lista de alumnos
    @Query("SELECT DISTINCT c FROM Curso c WHERE c.profesor = :u OR :u MEMBER OF c.alumnos")
    List<Curso> findByProfesorOrInvitado(@Param("u") Usuario u);
}
