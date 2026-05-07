package com.quizsloth.controller;

import com.quizsloth.model.Pregunta;
import com.quizsloth.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/preguntas")
public class PreguntaController {

    private final QuizService quizService;

    public PreguntaController(QuizService quizService) {
        this.quizService = quizService;
    }

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

    static class CrearPreguntaRequest {
        private Integer quizId;
        private Integer orden;

        public Integer getQuizId() { return quizId; }
        public void setQuizId(Integer quizId) { this.quizId = quizId; }
        public Integer getOrden() { return orden; }
        public void setOrden(Integer orden) { this.orden = orden; }
    }
}
