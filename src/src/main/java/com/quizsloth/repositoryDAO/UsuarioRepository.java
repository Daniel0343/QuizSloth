package com.quizsloth.repositoryDAO;

import com.quizsloth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    // Busca un usuario por su email
    Optional<Usuario> findByEmail(String email);

    // Comprueba si ya existe un usuario con ese email
    boolean existsByEmail(String email);
}
