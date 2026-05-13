package com.quizsloth.repositoryDAO;

import com.quizsloth.model.Coleccion;
import com.quizsloth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ColeccionRepository extends JpaRepository<Coleccion, Integer> {
    // Colecciones que pertenecen a un usuario concreto
    List<Coleccion> findByUsuario(Usuario usuario);
}
