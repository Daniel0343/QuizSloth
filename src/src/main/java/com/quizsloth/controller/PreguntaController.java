package com.quizsloth.controller;

import com.quizsloth.model.Pregunta;
import com.quizsloth.service.QuizService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/preguntas")
@RequiredArgsConstructor
public class PreguntaController {

    private final QuizService quizService;

    @PostMapping
    public ResponseEntity<Pregunta> crear(@RequestBody CrearPreguntaRequest req) {
        return ResponseEntity.ok(quizService.crearPregunta(req.getQuizId(), req.getOrden()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pregunta> actualizar(
            @PathVariable Integer id,
            @RequestBody QuizService.PreguntaUpdate req) {
        return ResponseEntity.ok(quizService.actualizarPregunta(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        quizService.eliminarPregunta(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    static class CrearPreguntaRequest {
        private Integer quizId;
        private Integer orden;
    }
}
