package com.quizsloth.controller;

import com.quizsloth.security.JwtUtil;
import com.quizsloth.service.ColeccionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.quizsloth.model.Quiz;

@RestController
@RequestMapping("/colecciones")
@RequiredArgsConstructor
public class ColeccionController {

    private final ColeccionService coleccionService;
    private final JwtUtil jwtUtil;

    private String emailFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try { return jwtUtil.extractEmail(header.substring(7)); } catch (Exception ignored) {}
        }
        return null;
    }

    @GetMapping("/mis-colecciones")
    public ResponseEntity<List<ColeccionService.ColeccionDTO>> misColecciones(HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.listarPorUsuario(email));
    }

    @PostMapping
    public ResponseEntity<ColeccionService.ColeccionDTO> crear(
            @RequestBody CrearColeccionRequest req, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.crear(req.getNombre(), email));
    }

    @PostMapping("/{id}/quizzes/{quizId}")
    public ResponseEntity<ColeccionService.ColeccionDTO> añadirQuiz(
            @PathVariable Integer id, @PathVariable Integer quizId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.añadirQuiz(id, quizId, email));
    }

    @GetMapping("/{id}/quizzes")
    public ResponseEntity<List<com.quizsloth.model.Quiz>> quizzesDeColeccion(
            @PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.obtenerQuizzes(id, email));
    }

    @DeleteMapping("/{id}/quizzes/{quizId}")
    public ResponseEntity<ColeccionService.ColeccionDTO> quitarQuiz(
            @PathVariable Integer id, @PathVariable Integer quizId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.quitarQuiz(id, quizId, email));
    }

    @PostMapping("/{id}/apuntes/{apunteId}")
    public ResponseEntity<ColeccionService.ColeccionDTO> añadirApunte(
            @PathVariable Integer id, @PathVariable Integer apunteId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.añadirApunte(id, apunteId, email));
    }

    @DeleteMapping("/{id}/apuntes/{apunteId}")
    public ResponseEntity<ColeccionService.ColeccionDTO> quitarApunte(
            @PathVariable Integer id, @PathVariable Integer apunteId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.quitarApunte(id, apunteId, email));
    }

    @Data
    static class CrearColeccionRequest {
        private String nombre;
    }
}
