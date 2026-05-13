package com.quizsloth.service;

import com.quizsloth.model.Documento;
import com.quizsloth.model.Pregunta;
import com.quizsloth.model.Quiz;
import com.quizsloth.model.Usuario;
import com.quizsloth.repositoryDAO.CategoriaRepository;
import com.quizsloth.repositoryDAO.DocumentoRepository;
import com.quizsloth.repositoryDAO.PreguntaRepository;
import com.quizsloth.repositoryDAO.QuizRepository;
import com.quizsloth.repositoryDAO.SalaRepository;
import com.quizsloth.repositoryDAO.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final PreguntaRepository preguntaRepository;
    private final DocumentoRepository documentoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final SalaRepository salaRepository;
    private final IAService iaService;

    public QuizService(QuizRepository quizRepository,
                       PreguntaRepository preguntaRepository,
                       DocumentoRepository documentoRepository,
                       CategoriaRepository categoriaRepository,
                       UsuarioRepository usuarioRepository,
                       SalaRepository salaRepository,
                       IAService iaService) {
        this.quizRepository = quizRepository;
        this.preguntaRepository = preguntaRepository;
        this.documentoRepository = documentoRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.salaRepository = salaRepository;
        this.iaService = iaService;
    }

    // Lista todos los quizzes publicados creados por profesores
    public List<Quiz> listarTodos() {
        return quizRepository.findByCreadorRolAndBorradorFalse(Usuario.Rol.profesor);
    }

    // Lista los quizzes publicados de una categoría concreta
    public List<Quiz> listarPorCategoria(Integer categoriaId) {
        return quizRepository.findByCategoriaIdAndCreadorRolAndBorradorFalse(categoriaId, Usuario.Rol.profesor);
    }

    // Lista los quizzes publicados de un usuario (sin borradores)
    public List<Quiz> listarPorCreador(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return quizRepository.findByCreadorAndBorradorFalse(usuario);
    }

    // Devuelve todos los quizzes del creador, incluyendo borradores
    public List<Quiz> listarTodosPorCreador(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return quizRepository.findByCreador(usuario);
    }

    // Marca un quiz como publicado para que sea visible en las categorías
    public Quiz publicar(Integer id) {
        Quiz quiz = obtener(id);
        quiz.setBorrador(false);
        return quizRepository.save(quiz);
    }

    // Vuelve un quiz al estado borrador ocultándolo de las categorías
    public Quiz despublicar(Integer id) {
        Quiz quiz = obtener(id);
        quiz.setBorrador(true);
        return quizRepository.save(quiz);
    }

    // Devuelve los quizzes del usuario con el conteo de preguntas de cada uno
    public List<QuizResumenDTO> listarPorCreadorDTO(String email) {
        return listarTodosPorCreador(email).stream()
                .map(q -> new QuizResumenDTO(
                        q.getId(),
                        q.getTitulo(),
                        q.getDificultad().name(),
                        q.getCategoria(),
                        preguntaRepository.countByQuiz(q)
                ))
                .toList();
    }

    // Elimina un quiz junto con todas sus salas y preguntas asociadas
    @Transactional
    public void eliminar(Integer id, String email) {
        Quiz quiz = obtener(id);
        salaRepository.findByQuiz(quiz).forEach(salaRepository::delete);
        preguntaRepository.findByQuiz(quiz).forEach(p -> preguntaRepository.deleteById(p.getId()));
        quizRepository.deleteById(id);
    }

    // Crea una pregunta vacía con valores por defecto en la posición indicada
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

    // Elimina una pregunta por su ID
    public void eliminarPregunta(Integer id) {
        preguntaRepository.deleteById(id);
    }

    // Recupera un quiz por ID o lanza excepción si no existe
    public Quiz obtener(Integer id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz no encontrado"));
    }

    // Devuelve las preguntas de un quiz ordenadas por su campo orden
    public List<Pregunta> obtenerPreguntas(Integer quizId) {
        Quiz quiz = obtener(quizId);
        return preguntaRepository.findByQuizOrderByOrden(quiz);
    }

    // Genera un quiz con preguntas IA a partir de un documento subido al servidor
    public Quiz generarDesdeDocumento(Integer documentoId, String titulo, int numPreguntas, String emailCreador) {
        Documento documento = documentoRepository.findById(documentoId)
                .orElseThrow(() -> new RuntimeException("Documento no encontrado"));

        List<Pregunta> generadas = iaService.generarPreguntas(documento, numPreguntas);
        Quiz quiz = new Quiz();
        quiz.setTitulo(titulo);
        quiz.setDocumento(documento);
        quiz.setDificultad(Quiz.Dificultad.normal);
        quiz.setBorrador(true);
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

    // Genera un quiz con preguntas IA a partir de texto libre
    @Transactional
    public QuizConPreguntas generarDesdeTexto(
            String titulo, String texto, int numPreguntas, String dificultad, Integer categoriaId, String emailCreador) {

        List<Pregunta> generadas = iaService.generarPreguntasDesdeTexto(texto, numPreguntas, dificultad);

        Quiz.Dificultad nivel = Quiz.Dificultad.normal;
        try { if (dificultad != null) nivel = Quiz.Dificultad.valueOf(dificultad); } catch (Exception ignored) {}

        Quiz quiz = new Quiz();
        quiz.setTitulo(titulo);
        quiz.setDificultad(nivel);
        quiz.setBorrador(true);
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

    // Lista todos los quizzes marcados como plantilla
    public List<Quiz> listarPlantillas() {
        return quizRepository.findByEsPlantillaTrue();
    }

    // Crea un nuevo quiz copiando las preguntas de la plantilla indicada
    @Transactional
    public QuizConPreguntas clonarPlantilla(Integer plantillaId, String emailCreador) {
        Quiz plantilla = obtener(plantillaId);
        List<Pregunta> preguntasOriginales = preguntaRepository.findByQuizOrderByOrden(plantilla);

        Quiz clon = new Quiz();
        clon.setTitulo(plantilla.getTitulo());
        clon.setDificultad(plantilla.getDificultad());
        clon.setCategoria(plantilla.getCategoria());
        clon.setEsPlantilla(false);
        clon.setBorrador(true);
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

    // Crea un quiz vacío en borrador con solo el título
    public Quiz crearVacio(String titulo, Integer categoriaId, String emailCreador) {
        Quiz quiz = new Quiz();
        quiz.setTitulo(titulo != null && !titulo.isBlank() ? titulo : "Nuevo Quiz");
        quiz.setDificultad(Quiz.Dificultad.normal);
        quiz.setBorrador(true);
        if (categoriaId != null) categoriaRepository.findById(categoriaId).ifPresent(quiz::setCategoria);
        if (emailCreador != null) usuarioRepository.findByEmail(emailCreador).ifPresent(quiz::setCreador);
        return quizRepository.save(quiz);
    }

    // Actualiza título, dificultad, categoría y color de un quiz existente
    public Quiz actualizarQuiz(Integer id, String titulo, String dificultad, Integer categoriaId, String color) {
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
        if (color != null && !color.isBlank()) quiz.setColor(color);
        return quizRepository.save(quiz);
    }

    // Actualiza los campos informados de una pregunta existente
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
        if (req.segundos() != null) p.setSegundos(Math.max(5, Math.min(300, req.segundos())));
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
            Double peso,
            Integer segundos
    ) {}
}
