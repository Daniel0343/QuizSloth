package com.quizsloth.controller;

import com.quizsloth.security.JwtUtil;
import com.quizsloth.service.CursoService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cursos")
public class CursoController {

    private final CursoService cursoService;
    private final JwtUtil jwtUtil;

    public CursoController(CursoService cursoService, JwtUtil jwtUtil) {
        this.cursoService = cursoService;
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

    // GET /cursos/mis-cursos - Lista los cursos del usuario según su rol
    @GetMapping("/mis-cursos")
    public ResponseEntity<List<CursoService.CursoDTO>> misCursos(HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.listarMisCursos(email));
    }

    // GET /cursos/{id} - Devuelve el detalle de un curso
    @GetMapping("/{id}")
    public ResponseEntity<CursoService.CursoDTO> obtener(@PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.obtener(id));
    }

    // GET /cursos/{id}/calificaciones - Devuelve las calificaciones de todos los quizzes del curso
    @GetMapping("/{id}/calificaciones")
    public ResponseEntity<List<CursoService.CalificacionQuizDTO>> calificaciones(@PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.getCalificaciones(id));
    }

    // DELETE /cursos/{id}/calificaciones/quiz/{quizId} - Borra las calificaciones de un quiz del curso
    @DeleteMapping("/{id}/calificaciones/quiz/{quizId}")
    public ResponseEntity<Void> eliminarCalificacionesQuiz(
            @PathVariable Integer id, @PathVariable Integer quizId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        cursoService.eliminarCalificacionesQuiz(id, quizId, email);
        return ResponseEntity.noContent().build();
    }

    // POST /cursos - Crea un nuevo curso con el usuario autenticado como profesor
    @PostMapping
    public ResponseEntity<CursoService.CursoDTO> crear(@RequestBody CrearCursoRequest req, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.crear(req.getNombre(), req.getDescripcion(), req.getColor(), email));
    }

    // PUT /cursos/{id} - Actualiza los datos del curso
    @PutMapping("/{id}")
    public ResponseEntity<CursoService.CursoDTO> actualizar(
            @PathVariable Integer id, @RequestBody CrearCursoRequest req, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.actualizar(id, req.getNombre(), req.getDescripcion(), req.getColor(), email));
    }

    // DELETE /cursos/{id} - Elimina un curso y todo su contenido
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        cursoService.eliminar(id, email);
        return ResponseEntity.noContent().build();
    }

    // GET /cursos/{id}/participantes - Lista profesor y alumnos del curso
    @GetMapping("/{id}/participantes")
    public ResponseEntity<List<CursoService.ParticipanteDTO>> participantes(
            @PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.listarParticipantes(id, email));
    }

    // POST /cursos/{id}/invitar - Añade un usuario al curso por email
    @PostMapping("/{id}/invitar")
    public ResponseEntity<?> invitar(
            @PathVariable Integer id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        try {
            return ResponseEntity.ok(cursoService.invitarAlumno(id, body.get("email"), email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DELETE /cursos/{id}/alumnos/{alumnoId} - Expulsa a un alumno del curso
    @DeleteMapping("/{id}/alumnos/{alumnoId}")
    public ResponseEntity<Void> quitarAlumno(
            @PathVariable Integer id, @PathVariable Integer alumnoId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        cursoService.quitarAlumno(id, alumnoId, email);
        return ResponseEntity.noContent().build();
    }

    // GET /cursos/{id}/secciones - Lista las secciones del curso ordenadas por posición
    @GetMapping("/{id}/secciones")
    public ResponseEntity<List<CursoService.SeccionDTO>> secciones(
            @PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.listarSecciones(id, email));
    }

    // POST /cursos/{id}/secciones - Crea una nueva sección en el curso
    @PostMapping("/{id}/secciones")
    public ResponseEntity<CursoService.SeccionDTO> crearSeccion(
            @PathVariable Integer id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.crearSeccion(id, body.get("titulo"), email));
    }

    // DELETE /cursos/secciones/{seccionId} - Elimina una sección y sus elementos
    @DeleteMapping("/secciones/{seccionId}")
    public ResponseEntity<Void> eliminarSeccion(@PathVariable Integer seccionId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        cursoService.eliminarSeccion(seccionId, email);
        return ResponseEntity.noContent().build();
    }

    // PUT /cursos/secciones/{seccionId} - Actualiza el título de una sección
    @PutMapping("/secciones/{seccionId}")
    public ResponseEntity<CursoService.SeccionDTO> editarSeccion(
            @PathVariable Integer seccionId, @RequestBody Map<String, String> body, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.editarSeccion(seccionId, body.get("titulo"), email));
    }

    // PUT /cursos/elementos/{elementoId} - Actualiza título y contenido de un elemento
    @PutMapping("/elementos/{elementoId}")
    public ResponseEntity<CursoService.ElementoDTO> editarElemento(
            @PathVariable Integer elementoId, @RequestBody CrearElementoRequest req, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.editarElemento(elementoId, req.getTitulo(), req.getContenido(), email));
    }

    // POST /cursos/secciones/{seccionId}/elementos - Crea un nuevo elemento en la sección
    @PostMapping("/secciones/{seccionId}/elementos")
    public ResponseEntity<CursoService.ElementoDTO> crearElemento(
            @PathVariable Integer seccionId, @RequestBody CrearElementoRequest req, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.crearElemento(seccionId, req.getTipo(), req.getTitulo(), req.getContenido(), email));
    }

    // DELETE /cursos/elementos/{elementoId} - Elimina un elemento de una sección
    @DeleteMapping("/elementos/{elementoId}")
    public ResponseEntity<Void> eliminarElemento(@PathVariable Integer elementoId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        cursoService.eliminarElemento(elementoId, email);
        return ResponseEntity.noContent().build();
    }

    static class CrearCursoRequest {
        String nombre;
        String descripcion;
        String color;

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
    }

    static class CrearElementoRequest {
        String tipo;
        String titulo;
        String contenido;

        public String getTipo() { return tipo; }
        public void setTipo(String tipo) { this.tipo = tipo; }
        public String getTitulo() { return titulo; }
        public void setTitulo(String titulo) { this.titulo = titulo; }
        public String getContenido() { return contenido; }
        public void setContenido(String contenido) { this.contenido = contenido; }
    }
}
