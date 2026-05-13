package com.quizsloth.repositoryDAO;

import com.quizsloth.model.Calificacion;
import com.quizsloth.model.Quiz;
import com.quizsloth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Integer> {

    // Todas las calificaciones de un usuario
    List<Calificacion> findByUsuario(Usuario usuario);

    // Todas las calificaciones de un quiz concreto
    List<Calificacion> findByQuiz(Quiz quiz);

    // Calificación de un usuario en un quiz específico
    Optional<Calificacion> findByUsuarioAndQuiz(Usuario usuario, Quiz quiz);

    // Calificaciones de varios quizzes a la vez
    List<Calificacion> findByQuizIn(List<Quiz> quizzes);

    // Elimina todas las calificaciones de un quiz
    void deleteByQuiz(Quiz quiz);
}
