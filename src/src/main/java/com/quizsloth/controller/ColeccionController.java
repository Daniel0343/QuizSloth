package com.quizsloth.controller;

import com.quizsloth.security.JwtUtil;
import com.quizsloth.service.ColeccionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.quizsloth.model.Quiz;

@RestController
@RequestMapping("/colecciones")
public class ColeccionController {

    private final ColeccionService coleccionService;
    private final JwtUtil jwtUtil;

    public ColeccionController(ColeccionService coleccionService, JwtUtil jwtUtil) {
        this.coleccionService = coleccionService;
        this.jwtUtil = jwtUtil;
    }

    // Extrae el email del token JWT del encabezado Authorization
    private String emailFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try { return jwtUtil.extractEmail(header.substring(7)); } catch (Exception ignored) {}
        }
        return null;
    }

    // GET /colecciones/mis-colecciones - Lista las colecciones del usuario autenticado
    @GetMapping("/mis-colecciones")
    public ResponseEntity<List<ColeccionService.ColeccionDTO>> misColecciones(HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.listarPorUsuario(email));
    }

    // POST /colecciones - Crea una nueva colección para el usuario
    @PostMapping
    public ResponseEntity<ColeccionService.ColeccionDTO> crear(
            @RequestBody CrearColeccionRequest req, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.crear(req.getNombre(), email));
    }

    // POST /colecciones/{id}/quizzes/{quizId} - Añade un quiz a la colección
    @PostMapping("/{id}/quizzes/{quizId}")
    public ResponseEntity<ColeccionService.ColeccionDTO> añadirQuiz(
            @PathVariable Integer id, @PathVariable Integer quizId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.añadirQuiz(id, quizId, email));
    }

    // GET /colecciones/{id}/quizzes - Lista los quizzes de la colección
    @GetMapping("/{id}/quizzes")
    public ResponseEntity<List<com.quizsloth.model.Quiz>> quizzesDeColeccion(
            @PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.obtenerQuizzes(id, email));
    }

    // GET /colecciones/{id}/apuntes - Lista los apuntes de la colección
    @GetMapping("/{id}/apuntes")
    public ResponseEntity<List<com.quizsloth.model.Apunte>> apuntesDeColeccion(
            @PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.obtenerApuntes(id, email));
    }

    // DELETE /colecciones/{id}/quizzes/{quizId} - Quita un quiz de la colección
    @DeleteMapping("/{id}/quizzes/{quizId}")
    public ResponseEntity<ColeccionService.ColeccionDTO> quitarQuiz(
            @PathVariable Integer id, @PathVariable Integer quizId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.quitarQuiz(id, quizId, email));
    }

    // POST /colecciones/{id}/apuntes/{apunteId} - Añade un apunte a la colección
    @PostMapping("/{id}/apuntes/{apunteId}")
    public ResponseEntity<ColeccionService.ColeccionDTO> añadirApunte(
            @PathVariable Integer id, @PathVariable Integer apunteId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.añadirApunte(id, apunteId, email));
    }

    // DELETE /colecciones/{id}/apuntes/{apunteId} - Quita un apunte de la colección
    @DeleteMapping("/{id}/apuntes/{apunteId}")
    public ResponseEntity<ColeccionService.ColeccionDTO> quitarApunte(
            @PathVariable Integer id, @PathVariable Integer apunteId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.quitarApunte(id, apunteId, email));
    }

    // DELETE /colecciones/{id} - Elimina la colección completa
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        coleccionService.eliminar(id, email);
        return ResponseEntity.noContent().build();
    }

    // PUT /colecciones/{id} - Cambia el nombre de la colección
    @PutMapping("/{id}")
    public ResponseEntity<ColeccionService.ColeccionDTO> renombrar(
            @PathVariable Integer id,
            @RequestBody CrearColeccionRequest req,
            HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(coleccionService.renombrar(id, req.getNombre(), email));
    }

    static class CrearColeccionRequest {
        private String nombre;

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
    }
}
