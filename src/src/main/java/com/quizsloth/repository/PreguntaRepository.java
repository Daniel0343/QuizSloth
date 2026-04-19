package com.quizsloth.repository;

import com.quizsloth.model.Pregunta;
import com.quizsloth.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * DAO de Preguntas — Evidencia 1
 */
@Repository
public interface PreguntaRepository extends JpaRepository<Pregunta, Integer> {

    List<Pregunta> findByQuiz(Quiz quiz);

    List<Pregunta> findByQuizOrderByOrden(Quiz quiz);

    int countByQuiz(Quiz quiz);
}
