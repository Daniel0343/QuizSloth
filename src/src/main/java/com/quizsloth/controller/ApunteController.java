package com.quizsloth.controller;

import com.quizsloth.model.Apunte;
import com.quizsloth.security.JwtUtil;
import com.quizsloth.service.ApunteService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/apuntes")
@RequiredArgsConstructor
public class ApunteController {

    private final ApunteService apunteService;
    private final JwtUtil jwtUtil;

    private String emailFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        log.info("Authorization header present: {}", header != null ? "yes (starts with Bearer: " + header.startsWith("Bearer ") + ")" : "NO");
        if (header != null && header.startsWith("Bearer ")) {
            try { return jwtUtil.extractEmail(header.substring(7)); } catch (Exception e) {
                log.error("Error extracting email from token: {}", e.getMessage());
            }
        }
        return null;
    }

    @PostMapping("/generar-desde-texto")
    public ResponseEntity<?> generarDesdeTexto(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        String texto = (String) body.get("texto");
        log.info("Generar apunte - email: {}, texto length: {}", email, texto != null ? texto.length() : 0);
        try {
            Apunte apunte = apunteService.generarDesdeTexto(texto, email);
            return ResponseEntity.ok(toResponse(apunte));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/generar-desde-archivo")
    public ResponseEntity<?> generarDesdeArchivo(
            @RequestParam("archivo") MultipartFile archivo,
            HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        try {
            String tipo = archivo.getContentType() != null ? archivo.getContentType() : "";
            Apunte apunte = apunteService.generarDesdeArchivo(archivo.getBytes(), tipo, email);
            return ResponseEntity.ok(toResponse(apunte));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/mis-apuntes")
    public ResponseEntity<List<ApunteService.ApunteResumenDTO>> misApuntes(HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(apunteService.listarPorUsuario(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtener(@PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(toResponse(apunteService.obtener(id, email)));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        try {
            Apunte apunte = apunteService.actualizar(id, body.get("titulo"), body.get("contenidoJson"), email);
            return ResponseEntity.ok(toResponse(apunte));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        try {
            apunteService.eliminar(id, email);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }

    private Map<String, Object> toResponse(Apunte a) {
        return Map.of(
            "id", a.getId(),
            "titulo", a.getTitulo(),
            "contenidoJson", a.getContenidoJson(),
            "fechaCreacion", a.getFechaCreacion() != null ? a.getFechaCreacion().toString() : ""
        );
    }
}
