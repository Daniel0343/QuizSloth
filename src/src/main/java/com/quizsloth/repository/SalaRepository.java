package com.quizsloth.repository;

import com.quizsloth.model.Quiz;
import com.quizsloth.model.Sala;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SalaRepository extends JpaRepository<Sala, Long> {
    Optional<Sala> findByCodigo(String codigo);
    boolean existsByCodigo(String codigo);
    List<Sala> findByQuiz(Quiz quiz);
}
