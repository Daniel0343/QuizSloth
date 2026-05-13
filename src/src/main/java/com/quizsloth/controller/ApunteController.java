package com.quizsloth.controller;

import com.quizsloth.model.Apunte;
import com.quizsloth.security.JwtUtil;
import com.quizsloth.service.ApunteService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/apuntes")
public class ApunteController {

    private static final Logger log = LoggerFactory.getLogger(ApunteController.class);

    private final ApunteService apunteService;
    private final JwtUtil jwtUtil;

    public ApunteController(ApunteService apunteService, JwtUtil jwtUtil) {
        this.apunteService = apunteService;
        this.jwtUtil = jwtUtil;
    }

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

    // POST /apuntes/generar-desde-texto - Genera apuntes con IA a partir de texto libre
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

    // POST /apuntes/generar-desde-archivo - Sube un PDF y genera apuntes con IA
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

    // GET /apuntes/mis-apuntes - Lista los apuntes del usuario autenticado
    @GetMapping("/mis-apuntes")
    public ResponseEntity<List<ApunteService.ApunteResumenDTO>> misApuntes(HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(apunteService.listarPorUsuario(email));
    }

    // GET /apuntes/{id} - Devuelve un apunte del usuario autenticado
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

    // GET /apuntes/{id}/ver - Devuelve un apunte para lectura sin verificar propiedad
    @GetMapping("/{id}/ver")
    public ResponseEntity<?> ver(@PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(toResponse(apunteService.obtenerParaLectura(id)));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /apuntes/{id} - Actualiza título y contenido de un apunte
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

    // DELETE /apuntes/{id} - Elimina un apunte del usuario autenticado
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

    // Convierte un Apunte en el mapa de respuesta JSON
    private Map<String, Object> toResponse(Apunte a) {
        return Map.of(
            "id", a.getId(),
            "titulo", a.getTitulo(),
            "contenidoJson", a.getContenidoJson(),
            "fechaCreacion", a.getFechaCreacion() != null ? a.getFechaCreacion().toString() : ""
        );
    }
}
