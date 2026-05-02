package com.quizsloth.repository;

import com.quizsloth.model.Calificacion;
import com.quizsloth.model.Quiz;
import com.quizsloth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Integer> {

    List<Calificacion> findByUsuario(Usuario usuario);

    List<Calificacion> findByQuiz(Quiz quiz);

    Optional<Calificacion> findByUsuarioAndQuiz(Usuario usuario, Quiz quiz);
}
