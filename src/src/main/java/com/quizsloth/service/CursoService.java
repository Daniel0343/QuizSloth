package com.quizsloth.service;

import com.quizsloth.model.Curso;
import com.quizsloth.model.Usuario;
import com.quizsloth.repository.CursoRepository;
import com.quizsloth.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<Curso> listarTodos() {
        return cursoRepository.findAll();
    }

    public List<Curso> listarPorProfesor(Integer profesorId) {
        Usuario profesor = usuarioRepository.findById(profesorId)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
        return cursoRepository.findByProfesor(profesor);
    }

    public Curso obtener(Integer id) {
        return cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
    }

    public Curso crear(Curso curso) {
        return cursoRepository.save(curso);
    }

    public Curso actualizar(Integer id, Curso datos) {
        Curso curso = obtener(id);
        curso.setNombre(datos.getNombre());
        curso.setDescripcion(datos.getDescripcion());
        return cursoRepository.save(curso);
    }

    public void eliminar(Integer id) {
        cursoRepository.deleteById(id);
    }
}
