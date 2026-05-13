package com.quizsloth.service;

import com.quizsloth.model.Apunte;
import com.quizsloth.model.Coleccion;
import com.quizsloth.model.Quiz;
import com.quizsloth.model.Usuario;
import com.quizsloth.repositoryDAO.ApunteRepository;
import com.quizsloth.repositoryDAO.ColeccionRepository;
import com.quizsloth.repositoryDAO.QuizRepository;
import com.quizsloth.repositoryDAO.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ColeccionService {

    private final ColeccionRepository coleccionRepository;
    private final UsuarioRepository usuarioRepository;
    private final QuizRepository quizRepository;
    private final ApunteRepository apunteRepository;

    public ColeccionService(ColeccionRepository coleccionRepository,
                            UsuarioRepository usuarioRepository,
                            QuizRepository quizRepository,
                            ApunteRepository apunteRepository) {
        this.coleccionRepository = coleccionRepository;
        this.usuarioRepository = usuarioRepository;
        this.quizRepository = quizRepository;
        this.apunteRepository = apunteRepository;
    }

    public record ColeccionDTO(Integer id, String nombre, int cantidad) {}

    // Lista las colecciones del usuario con el total de quizzes y apuntes en cada una
    public List<ColeccionDTO> listarPorUsuario(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return coleccionRepository.findByUsuario(usuario).stream()
                .map(c -> new ColeccionDTO(c.getId(), c.getNombre(), c.getQuizzes().size() + c.getApuntes().size()))
                .toList();
    }

    // Crea una nueva colección vacía para el usuario
    public ColeccionDTO crear(String nombre, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Coleccion coleccion = new Coleccion();
        coleccion.setNombre(nombre);
        coleccion.setUsuario(usuario);
        Coleccion guardada = coleccionRepository.save(coleccion);
        return new ColeccionDTO(guardada.getId(), guardada.getNombre(), 0);
    }

    // Añade un quiz a la colección si no está ya incluido
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

    // Devuelve la lista de quizzes de una colección
    public List<Quiz> obtenerQuizzes(Integer coleccionId, String email) {
        Coleccion coleccion = coleccionRepository.findById(coleccionId)
                .orElseThrow(() -> new RuntimeException("Colección no encontrada"));
        if (!coleccion.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No tienes permiso");
        }
        return coleccion.getQuizzes();
    }

    // Devuelve la lista de apuntes de una colección
    public List<Apunte> obtenerApuntes(Integer coleccionId, String email) {
        Coleccion coleccion = coleccionRepository.findById(coleccionId)
                .orElseThrow(() -> new RuntimeException("Colección no encontrada"));
        if (!coleccion.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No tienes permiso");
        }
        return coleccion.getApuntes();
    }

    // Añade un apunte a la colección si no está ya incluido
    public ColeccionDTO añadirApunte(Integer coleccionId, Integer apunteId, String email) {
        Coleccion coleccion = coleccionRepository.findById(coleccionId)
                .orElseThrow(() -> new RuntimeException("Colección no encontrada"));
        if (!coleccion.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No tienes permiso para modificar esta colección");
        }
        Apunte apunte = apunteRepository.findById(apunteId)
                .orElseThrow(() -> new RuntimeException("Apunte no encontrado"));
        if (!coleccion.getApuntes().contains(apunte)) {
            coleccion.getApuntes().add(apunte);
            coleccionRepository.save(coleccion);
        }
        return new ColeccionDTO(coleccion.getId(), coleccion.getNombre(),
                coleccion.getQuizzes().size() + coleccion.getApuntes().size());
    }

    // Elimina un apunte de la colección
    public ColeccionDTO quitarApunte(Integer coleccionId, Integer apunteId, String email) {
        Coleccion coleccion = coleccionRepository.findById(coleccionId)
                .orElseThrow(() -> new RuntimeException("Colección no encontrada"));
        if (!coleccion.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No tienes permiso para modificar esta colección");
        }
        coleccion.getApuntes().removeIf(a -> a.getId().equals(apunteId));
        coleccionRepository.save(coleccion);
        return new ColeccionDTO(coleccion.getId(), coleccion.getNombre(),
                coleccion.getQuizzes().size() + coleccion.getApuntes().size());
    }

    // Elimina un quiz de la colección
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

    // Elimina la colección completa del usuario
    public void eliminar(Integer coleccionId, String email) {
        Coleccion coleccion = coleccionRepository.findById(coleccionId)
                .orElseThrow(() -> new RuntimeException("Colección no encontrada"));
        if (!coleccion.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No tienes permiso para eliminar esta colección");
        }
        coleccionRepository.delete(coleccion);
    }

    // Cambia el nombre de la colección
    public ColeccionDTO renombrar(Integer coleccionId, String nuevoNombre, String email) {
        Coleccion coleccion = coleccionRepository.findById(coleccionId)
                .orElseThrow(() -> new RuntimeException("Colección no encontrada"));
        if (!coleccion.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No tienes permiso para modificar esta colección");
        }
        coleccion.setNombre(nuevoNombre);
        coleccionRepository.save(coleccion);
        return new ColeccionDTO(coleccion.getId(), coleccion.getNombre(),
                coleccion.getQuizzes().size() + coleccion.getApuntes().size());
    }
}
