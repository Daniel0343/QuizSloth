package com.quizsloth.controller;

import com.quizsloth.model.Pregunta;
import com.quizsloth.model.Quiz;
import com.quizsloth.service.IAService;
import com.quizsloth.service.QuizService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final IAService iaService;

    @GetMapping
    public ResponseEntity<List<Quiz>> listar(
            @RequestParam(required = false) Integer categoriaId) {
        if (categoriaId != null) return ResponseEntity.ok(quizService.listarPorCategoria(categoriaId));
        return ResponseEntity.ok(quizService.listarTodos());
    }

    @GetMapping("/mis-quizzes")
    public ResponseEntity<List<Quiz>> misQuizzes(Authentication authentication) {
        return ResponseEntity.ok(quizService.listarPorCreador(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Quiz> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(quizService.obtener(id));
    }

    @GetMapping("/{id}/preguntas")
    public ResponseEntity<List<Pregunta>> preguntas(@PathVariable Integer id) {
        return ResponseEntity.ok(quizService.obtenerPreguntas(id));
    }

    @PostMapping("/generar")
    public ResponseEntity<Quiz> generarConIA(@RequestBody GenerarQuizRequest request, Authentication authentication) {
        Quiz quiz = quizService.generarDesdeDocumento(
                request.getDocumentoId(), request.getTitulo(), request.getNumPreguntas(),
                authentication.getName());
        return ResponseEntity.ok(quiz);
    }

    @PostMapping("/generar-desde-texto")
    public ResponseEntity<QuizService.QuizConPreguntas> generarDesdeTexto(
            @RequestBody GenerarDesdeTextoRequest req, Authentication authentication) {
        QuizService.QuizConPreguntas resultado = quizService.generarDesdeTexto(
                req.getTitulo(), req.getTexto(), req.getNumPreguntas(), req.getCategoriaId(),
                authentication.getName());
        return ResponseEntity.ok(resultado);
    }

    @PostMapping("/generar-desde-archivo")
    public ResponseEntity<QuizService.QuizConPreguntas> generarDesdeArchivo(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("titulo") String titulo,
            @RequestParam("numPreguntas") int numPreguntas,
            @RequestParam(value = "categoriaId", required = false) Integer categoriaId,
            Authentication authentication) throws Exception {

        String nombre = archivo.getOriginalFilename() != null ? archivo.getOriginalFilename().toLowerCase() : "";
        byte[] bytes = archivo.getBytes();

        String texto;
        if (nombre.endsWith(".pdf")) {
            texto = iaService.extraerTextoPDF(bytes);
        } else if (nombre.endsWith(".pptx")) {
            texto = iaService.extraerTextoPPTX(bytes);
        } else {
            texto = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
        }

        QuizService.QuizConPreguntas resultado = quizService.generarDesdeTexto(
                titulo, texto, numPreguntas, categoriaId, authentication.getName());
        return ResponseEntity.ok(resultado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quiz> actualizarQuiz(
            @PathVariable Integer id,
            @RequestBody ActualizarQuizRequest req) {
        Quiz quiz = quizService.actualizarQuiz(
                id, req.getTitulo(), req.getDificultad(), req.getCategoriaId());
        return ResponseEntity.ok(quiz);
    }

    @Data
    static class GenerarQuizRequest {
        private Integer documentoId;
        private String titulo;
        private int numPreguntas = 5;
    }

    @Data
    static class GenerarDesdeTextoRequest {
        private String titulo;
        private String texto;
        private int numPreguntas = 5;
        private Integer categoriaId;
    }

    @Data
    static class ActualizarQuizRequest {
        private String titulo;
        private String dificultad;
        private Integer categoriaId;
    }
}
