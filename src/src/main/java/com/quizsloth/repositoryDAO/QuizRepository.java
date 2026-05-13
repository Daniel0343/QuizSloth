package com.quizsloth.repositoryDAO;

import com.quizsloth.model.Documento;
import com.quizsloth.model.Quiz;
import com.quizsloth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {

    // Quizzes asociados a un documento concreto
    List<Quiz> findByDocumento(Documento documento);

    // Quizzes filtrados por nivel de dificultad
    List<Quiz> findByDificultad(Quiz.Dificultad dificultad);

    // Quizzes de una categoría concreta
    List<Quiz> findByCategoriaId(Integer categoriaId);

    // Todos los quizzes de un creador, incluyendo borradores
    List<Quiz> findByCreador(Usuario creador);

    // Quizzes cuyo creador tiene el rol indicado
    List<Quiz> findByCreadorRol(Usuario.Rol rol);

    // Quizzes de una categoría cuyo creador tiene el rol indicado
    List<Quiz> findByCategoriaIdAndCreadorRol(Integer categoriaId, Usuario.Rol rol);

    // Quizzes publicados (no borrador) cuyo creador tiene el rol indicado
    List<Quiz> findByCreadorRolAndBorradorFalse(Usuario.Rol rol);

    // Quizzes publicados de una categoría cuyo creador tiene el rol indicado
    List<Quiz> findByCategoriaIdAndCreadorRolAndBorradorFalse(Integer categoriaId, Usuario.Rol rol);

    // Quizzes publicados de un creador concreto
    List<Quiz> findByCreadorAndBorradorFalse(Usuario creador);

    // Quizzes marcados como plantilla
    List<Quiz> findByEsPlantillaTrue();
}
