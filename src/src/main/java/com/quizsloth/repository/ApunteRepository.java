package com.quizsloth.repository;

import com.quizsloth.model.Apunte;
import com.quizsloth.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApunteRepository extends JpaRepository<Apunte, Integer> {
    List<Apunte> findByUsuarioOrderByFechaCreacionDesc(Usuario usuario);
}
