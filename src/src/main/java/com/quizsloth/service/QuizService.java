package com.quizsloth.service;

import com.quizsloth.model.Documento;
import com.quizsloth.model.Pregunta;
import com.quizsloth.model.Quiz;
import com.quizsloth.model.Usuario;
import com.quizsloth.repository.CategoriaRepository;
import com.quizsloth.repository.DocumentoRepository;
import com.quizsloth.repository.PreguntaRepository;
import com.quizsloth.repository.QuizRepository;
import com.quizsloth.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final PreguntaRepository preguntaRepository;
    private final DocumentoRepository documentoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final IAService iaService;

    public List<Quiz> listarTodos() {
        return quizRepository.findAll();
    }

    public List<Quiz> listarPorCategoria(Integer categoriaId) {
        return quizRepository.findByCategoriaId(categoriaId);
    }

    public List<Quiz> listarPorCreador(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return quizRepository.findByCreador(usuario);
    }

    public Quiz obtener(Integer id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz no encontrado"));
    }

    public List<Pregunta> obtenerPreguntas(Integer quizId) {
        Quiz quiz = obtener(quizId);
        return preguntaRepository.findByQuizOrderByOrden(quiz);
    }

    public Quiz generarDesdeDocumento(Integer documentoId, String titulo, int numPreguntas, String emailCreador) {
        Documento documento = documentoRepository.findById(documentoId)
                .orElseThrow(() -> new RuntimeException("Documento no encontrado"));

        List<Pregunta> generadas = iaService.generarPreguntas(documento, numPreguntas);
        Quiz quiz = new Quiz();
        quiz.setTitulo(titulo);
        quiz.setDocumento(documento);
        quiz.setDificultad(Quiz.Dificultad.normal);
        usuarioRepository.findByEmail(emailCreador).ifPresent(quiz::setCreador);
        Quiz saved = quizRepository.save(quiz);

        for (int i = 0; i < generadas.size(); i++) {
            Pregunta p = generadas.get(i);
            p.setQuiz(saved);
            p.setOrden(i);
            preguntaRepository.save(p);
        }
        return saved;
    }

    @Transactional
    public QuizConPreguntas generarDesdeTexto(
            String titulo, String texto, int numPreguntas, Integer categoriaId, String emailCreador) {

        List<Pregunta> generadas = iaService.generarPreguntasDesdeTexto(texto, numPreguntas);

        Quiz quiz = new Quiz();
        quiz.setTitulo(titulo);
        quiz.setDificultad(Quiz.Dificultad.normal);
        categoriaRepository.findById(categoriaId != null ? categoriaId : -1)
                .ifPresent(quiz::setCategoria);
        usuarioRepository.findByEmail(emailCreador).ifPresent(quiz::setCreador);
        Quiz saved = quizRepository.save(quiz);

        for (int i = 0; i < generadas.size(); i++) {
            Pregunta p = generadas.get(i);
            p.setQuiz(saved);
            p.setOrden(i);
            preguntaRepository.save(p);
        }

        List<Pregunta> preguntas = preguntaRepository.findByQuizOrderByOrden(saved);
        return new QuizConPreguntas(saved, preguntas);
    }

    public Quiz actualizarQuiz(Integer id, String titulo, String dificultad, Integer categoriaId) {
        Quiz quiz = obtener(id);
        if (titulo != null && !titulo.isBlank()) quiz.setTitulo(titulo);
        if (dificultad != null) {
            try {
                quiz.setDificultad(Quiz.Dificultad.valueOf(dificultad));
            } catch (IllegalArgumentException ignored) {}
        }
        if (categoriaId != null) {
            categoriaRepository.findById(categoriaId).ifPresent(quiz::setCategoria);
        }
        return quizRepository.save(quiz);
    }

    public Pregunta actualizarPregunta(Integer id, PreguntaUpdate req) {
        Pregunta p = preguntaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pregunta no encontrada"));
        if (req.enunciado() != null) p.setEnunciado(req.enunciado());
        if (req.opcionA() != null) p.setOpcionA(req.opcionA());
        if (req.opcionB() != null) p.setOpcionB(req.opcionB());
        if (req.opcionC() != null) p.setOpcionC(req.opcionC());
        if (req.opcionD() != null) p.setOpcionD(req.opcionD());
        if (req.respuestaCorrecta() != null) p.setRespuestaCorrecta(req.respuestaCorrecta().toUpperCase());
        if (req.dificultad() != null) {
            try {
                p.setDificultad(Quiz.Dificultad.valueOf(req.dificultad()));
            } catch (IllegalArgumentException ignored) {}
        }
        if (req.orden() != null) p.setOrden(req.orden());
        if (req.peso() != null) p.setPeso(BigDecimal.valueOf(req.peso()));
        return preguntaRepository.save(p);
    }

    public record QuizConPreguntas(Quiz quiz, List<Pregunta> preguntas) {}

    public record PreguntaUpdate(
            String enunciado,
            String opcionA,
            String opcionB,
            String opcionC,
            String opcionD,
            String respuestaCorrecta,
            String dificultad,
            Integer orden,
            Double peso
    ) {}
}
