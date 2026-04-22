package com.quizsloth.repository;

import com.quizsloth.model.SeccionCurso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeccionCursoRepository extends JpaRepository<SeccionCurso, Integer> {
    List<SeccionCurso> findByCurso_IdOrderByOrdenAsc(Integer cursoId);
}
