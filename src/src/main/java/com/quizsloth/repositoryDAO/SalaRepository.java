package com.quizsloth.repositoryDAO;

import com.quizsloth.model.Quiz;
import com.quizsloth.model.Sala;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SalaRepository extends JpaRepository<Sala, Long> {
    // Busca una sala por su código de 6 caracteres
    Optional<Sala> findByCodigo(String codigo);
    // Comprueba si ya existe una sala con ese código (para evitar duplicados)
    boolean existsByCodigo(String codigo);
    // Salas asociadas a un quiz concreto
    List<Sala> findByQuiz(Quiz quiz);
}
