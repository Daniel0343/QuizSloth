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

    public List<QuizResumenDTO> listarPorCreadorDTO(String email) {
        return listarPorCreador(email).stream()
                .map(q -> new QuizResumenDTO(
                        q.getId(),
                        q.getTitulo(),
                        q.getDificultad().name(),
                        q.getCategoria(),
                        preguntaRepository.countByQuiz(q)
                ))
                .toList();
    }

    public void eliminar(Integer id, String email) {
        Quiz quiz = obtener(id);
        preguntaRepository.findByQuiz(quiz).forEach(p -> preguntaRepository.deleteById(p.getId()));
        quizRepository.deleteById(id);
    }

    public Pregunta crearPregunta(Integer quizId, Integer orden) {
        Quiz quiz = obtener(quizId);
        Pregunta p = new Pregunta();
        p.setQuiz(quiz);
        p.setEnunciado("Nueva pregunta");
        p.setOpcionA("Opción A");
        p.setOpcionB("Opción B");
        p.setOpcionC("Opción C");
        p.setOpcionD("Opción D");
        p.setRespuestaCorrecta("A");
        p.setDificultad(Quiz.Dificultad.normal);
        p.setOrden(orden != null ? orden : 0);
        return preguntaRepository.save(p);
    }

    public void eliminarPregunta(Integer id) {
        preguntaRepository.deleteById(id);
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
        if (emailCreador != null) usuarioRepository.findByEmail(emailCreador).ifPresent(quiz::setCreador);
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
        if (emailCreador != null) usuarioRepository.findByEmail(emailCreador).ifPresent(quiz::setCreador);
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

    public List<Quiz> listarPlantillas() {
        return quizRepository.findByEsPlantillaTrue();
    }

    @Transactional
    public QuizConPreguntas clonarPlantilla(Integer plantillaId, String emailCreador) {
        Quiz plantilla = obtener(plantillaId);
        List<Pregunta> preguntasOriginales = preguntaRepository.findByQuizOrderByOrden(plantilla);

        Quiz clon = new Quiz();
        clon.setTitulo(plantilla.getTitulo());
        clon.setDificultad(plantilla.getDificultad());
        clon.setCategoria(plantilla.getCategoria());
        clon.setEsPlantilla(false);
        if (emailCreador != null) usuarioRepository.findByEmail(emailCreador).ifPresent(clon::setCreador);
        Quiz savedClon = quizRepository.save(clon);

        for (int i = 0; i < preguntasOriginales.size(); i++) {
            Pregunta orig = preguntasOriginales.get(i);
            Pregunta copia = new Pregunta();
            copia.setQuiz(savedClon);
            copia.setEnunciado(orig.getEnunciado());
            copia.setOpcionA(orig.getOpcionA());
            copia.setOpcionB(orig.getOpcionB());
            copia.setOpcionC(orig.getOpcionC());
            copia.setOpcionD(orig.getOpcionD());
            copia.setRespuestaCorrecta(orig.getRespuestaCorrecta());
            copia.setDificultad(orig.getDificultad());
            copia.setOrden(i);
            preguntaRepository.save(copia);
        }

        List<Pregunta> preguntas = preguntaRepository.findByQuizOrderByOrden(savedClon);
        return new QuizConPreguntas(savedClon, preguntas);
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

    public record QuizResumenDTO(
            Integer id,
            String titulo,
            String dificultad,
            com.quizsloth.model.Categoria categoria,
            int numPreguntas
    ) {}

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
