package com.quizsloth.repositoryDAO;

import com.quizsloth.model.Apunte;
import com.quizsloth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApunteRepository extends JpaRepository<Apunte, Integer> {
    // Apuntes del usuario ordenados del más reciente al más antiguo
    List<Apunte> findByUsuarioOrderByFechaCreacionDesc(Usuario usuario);
}
