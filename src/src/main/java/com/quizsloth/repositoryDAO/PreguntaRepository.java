package com.quizsloth.repositoryDAO;

import com.quizsloth.model.Pregunta;
import com.quizsloth.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreguntaRepository extends JpaRepository<Pregunta, Integer> {

    // Todas las preguntas de un quiz sin orden garantizado
    List<Pregunta> findByQuiz(Quiz quiz);

    // Preguntas de un quiz ordenadas por el campo orden
    List<Pregunta> findByQuizOrderByOrden(Quiz quiz);

    // Preguntas de un quiz por su ID, ordenadas por el campo orden
    List<Pregunta> findByQuizIdOrderByOrden(Integer quizId);

    // Número de preguntas que tiene un quiz
    int countByQuiz(Quiz quiz);
}
