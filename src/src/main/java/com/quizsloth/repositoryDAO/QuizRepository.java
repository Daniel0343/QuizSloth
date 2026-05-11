package com.quizsloth.repositoryDAO;

import com.quizsloth.model.Documento;
import com.quizsloth.model.Quiz;
import com.quizsloth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {

    List<Quiz> findByDocumento(Documento documento);

    List<Quiz> findByDificultad(Quiz.Dificultad dificultad);

    List<Quiz> findByCategoriaId(Integer categoriaId);

    List<Quiz> findByCreador(Usuario creador);

    List<Quiz> findByCreadorRol(Usuario.Rol rol);

    List<Quiz> findByCategoriaIdAndCreadorRol(Integer categoriaId, Usuario.Rol rol);

    List<Quiz> findByCreadorRolAndBorradorFalse(Usuario.Rol rol);

    List<Quiz> findByCategoriaIdAndCreadorRolAndBorradorFalse(Integer categoriaId, Usuario.Rol rol);

    List<Quiz> findByCreadorAndBorradorFalse(Usuario creador);

    List<Quiz> findByEsPlantillaTrue();
}
