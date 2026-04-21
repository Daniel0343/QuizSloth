package com.quizsloth.controller;

import com.quizsloth.model.Plantilla;
import com.quizsloth.security.JwtUtil;
import com.quizsloth.service.PlantillaService;
import com.quizsloth.service.QuizService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plantillas")
@RequiredArgsConstructor
public class PlantillaController {

    private final PlantillaService plantillaService;
    private final JwtUtil jwtUtil;

    private String emailFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try { return jwtUtil.extractEmail(header.substring(7)); } catch (Exception ignored) {}
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<Plantilla>> listar() {
        return ResponseEntity.ok(plantillaService.listar());
    }

    @PostMapping("/{id}/clonar")
    public ResponseEntity<QuizService.QuizConPreguntas> clonar(
            @PathVariable Integer id, HttpServletRequest request) {
        return ResponseEntity.ok(plantillaService.clonar(id, emailFromRequest(request)));
    }
}
