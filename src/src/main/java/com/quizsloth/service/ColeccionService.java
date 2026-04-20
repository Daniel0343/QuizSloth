package com.quizsloth.service;

import com.quizsloth.model.Coleccion;
import com.quizsloth.model.Quiz;
import com.quizsloth.model.Usuario;
import com.quizsloth.repository.ColeccionRepository;
import com.quizsloth.repository.QuizRepository;
import com.quizsloth.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ColeccionService {

    private final ColeccionRepository coleccionRepository;
    private final UsuarioRepository usuarioRepository;
    private final QuizRepository quizRepository;

    public record ColeccionDTO(Integer id, String nombre, int cantidad) {}

    public List<ColeccionDTO> listarPorUsuario(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return coleccionRepository.findByUsuario(usuario).stream()
                .map(c -> new ColeccionDTO(c.getId(), c.getNombre(), c.getQuizzes().size()))
                .toList();
    }

    public ColeccionDTO crear(String nombre, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Coleccion coleccion = new Coleccion();
        coleccion.setNombre(nombre);
        coleccion.setUsuario(usuario);
        Coleccion guardada = coleccionRepository.save(coleccion);
        return new ColeccionDTO(guardada.getId(), guardada.getNombre(), 0);
    }

    public ColeccionDTO añadirQuiz(Integer coleccionId, Integer quizId, String email) {
        Coleccion coleccion = coleccionRepository.findById(coleccionId)
                .orElseThrow(() -> new RuntimeException("Colección no encontrada"));
        if (!coleccion.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No tienes permiso para modificar esta colección");
        }
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz no encontrado"));
        if (!coleccion.getQuizzes().contains(quiz)) {
            coleccion.getQuizzes().add(quiz);
            coleccionRepository.save(coleccion);
        }
        return new ColeccionDTO(coleccion.getId(), coleccion.getNombre(), coleccion.getQuizzes().size());
    }

    public List<Quiz> obtenerQuizzes(Integer coleccionId, String email) {
        Coleccion coleccion = coleccionRepository.findById(coleccionId)
                .orElseThrow(() -> new RuntimeException("Colección no encontrada"));
        if (!coleccion.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No tienes permiso");
        }
        return coleccion.getQuizzes();
    }

    public ColeccionDTO quitarQuiz(Integer coleccionId, Integer quizId, String email) {
        Coleccion coleccion = coleccionRepository.findById(coleccionId)
                .orElseThrow(() -> new RuntimeException("Colección no encontrada"));
        if (!coleccion.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No tienes permiso para modificar esta colección");
        }
        coleccion.getQuizzes().removeIf(q -> q.getId().equals(quizId));
        coleccionRepository.save(coleccion);
        return new ColeccionDTO(coleccion.getId(), coleccion.getNombre(), coleccion.getQuizzes().size());
    }
}
