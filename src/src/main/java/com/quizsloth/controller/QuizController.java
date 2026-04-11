package com.quizsloth.controller;

import com.quizsloth.model.Pregunta;
import com.quizsloth.model.Quiz;
import com.quizsloth.service.QuizService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping
    public ResponseEntity<List<Quiz>> listar(
            @RequestParam(required = false) Integer categoriaId) {
        if (categoriaId != null) {
            return ResponseEntity.ok(quizService.listarPorCategoria(categoriaId));
        }
        return ResponseEntity.ok(quizService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(quizService.obtener(id));
    }

    @GetMapping("/{id}/preguntas")
    public ResponseEntity<List<Pregunta>> preguntas(@PathVariable Integer id) {
        return ResponseEntity.ok(quizService.obtenerPreguntas(id));
    }

    /**
     * Genera un quiz automáticamente usando IA (Evidencia 4).
     * POST /api/quizzes/generar
     * Body: { "documentoId": 1, "titulo": "Quiz Java", "numPreguntas": 5 }
     */
    @PostMapping("/generar")
    public ResponseEntity<Quiz> generarConIA(@RequestBody GenerarQuizRequest request) {
        Quiz quiz = quizService.generarDesdeDocumento(
                request.getDocumentoId(),
                request.getTitulo(),
                request.getNumPreguntas()
        );
        return ResponseEntity.ok(quiz);
    }

    @Data
    static class GenerarQuizRequest {
        private Integer documentoId;
        private String titulo;
        private int numPreguntas = 5;
    }
}
