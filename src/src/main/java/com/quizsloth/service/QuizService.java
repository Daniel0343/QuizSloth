package com.quizsloth.service;

import com.quizsloth.model.Documento;
import com.quizsloth.model.Pregunta;
import com.quizsloth.model.Quiz;
import com.quizsloth.repository.DocumentoRepository;
import com.quizsloth.repository.PreguntaRepository;
import com.quizsloth.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final PreguntaRepository preguntaRepository;
    private final DocumentoRepository documentoRepository;
    private final IAService iaService;

    public List<Quiz> listarTodos() {
        return quizRepository.findAll();
    }

    public List<Quiz> listarPorCategoria(Integer categoriaId) {
        return quizRepository.findByCategoriaId(categoriaId);
    }

    public Quiz obtener(Integer id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz no encontrado"));
    }

    public List<Pregunta> obtenerPreguntas(Integer quizId) {
        Quiz quiz = obtener(quizId);
        return preguntaRepository.findByQuiz(quiz);
    }

    /**
     * Genera un quiz a partir de un documento usando IA (Evidencia 4).
     */
    public Quiz generarDesdeDocumento(Integer documentoId, String titulo, int numPreguntas) {
        Documento documento = documentoRepository.findById(documentoId)
                .orElseThrow(() -> new RuntimeException("Documento no encontrado"));

        // Genera preguntas con IA
        List<Pregunta> preguntasGeneradas = iaService.generarPreguntas(documento, numPreguntas);

        Quiz quiz = new Quiz();
        quiz.setTitulo(titulo);
        quiz.setDocumento(documento);
        quiz.setDificultad(Quiz.Dificultad.normal);
        Quiz saved = quizRepository.save(quiz);

        // Asocia cada pregunta al quiz y guarda
        preguntasGeneradas.forEach(p -> {
            p.setQuiz(saved);
            preguntaRepository.save(p);
        });

        return saved;
    }
}
