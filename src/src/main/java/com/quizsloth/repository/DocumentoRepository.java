package com.quizsloth.repository;

import com.quizsloth.model.Curso;
import com.quizsloth.model.Documento;
import com.quizsloth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * DAO de Documentos — Evidencia 1
 */
@Repository
public interface DocumentoRepository extends JpaRepository<Documento, Integer> {

    List<Documento> findByCurso(Curso curso);

    List<Documento> findByUsuario(Usuario usuario);
}
