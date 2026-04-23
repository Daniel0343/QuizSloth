package com.quizsloth.controller;

import com.quizsloth.security.JwtUtil;
import com.quizsloth.service.CursoService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cursos")
@RequiredArgsConstructor
public class CursoController {

    private final CursoService cursoService;
    private final JwtUtil jwtUtil;

    private String emailFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try { return jwtUtil.extractEmail(header.substring(7)); } catch (Exception ignored) {}
        }
        return null;
    }

    @GetMapping("/mis-cursos")
    public ResponseEntity<List<CursoService.CursoDTO>> misCursos(HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.listarMisCursos(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CursoService.CursoDTO> obtener(@PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.obtener(id));
    }

    @PostMapping
    public ResponseEntity<CursoService.CursoDTO> crear(@RequestBody CrearCursoRequest req, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.crear(req.getNombre(), req.getDescripcion(), req.getColor(), email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CursoService.CursoDTO> actualizar(
            @PathVariable Integer id, @RequestBody CrearCursoRequest req, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.actualizar(id, req.getNombre(), req.getDescripcion(), req.getColor(), email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        cursoService.eliminar(id, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/participantes")
    public ResponseEntity<List<CursoService.ParticipanteDTO>> participantes(
            @PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.listarParticipantes(id, email));
    }

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

    @DeleteMapping("/{id}/alumnos/{alumnoId}")
    public ResponseEntity<Void> quitarAlumno(
            @PathVariable Integer id, @PathVariable Integer alumnoId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        cursoService.quitarAlumno(id, alumnoId, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/secciones")
    public ResponseEntity<List<CursoService.SeccionDTO>> secciones(
            @PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.listarSecciones(id, email));
    }

    @PostMapping("/{id}/secciones")
    public ResponseEntity<CursoService.SeccionDTO> crearSeccion(
            @PathVariable Integer id, @RequestBody Map<String, String> body, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.crearSeccion(id, body.get("titulo"), email));
    }

    @DeleteMapping("/secciones/{seccionId}")
    public ResponseEntity<Void> eliminarSeccion(@PathVariable Integer seccionId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        cursoService.eliminarSeccion(seccionId, email);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/secciones/{seccionId}")
    public ResponseEntity<CursoService.SeccionDTO> editarSeccion(
            @PathVariable Integer seccionId, @RequestBody Map<String, String> body, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.editarSeccion(seccionId, body.get("titulo"), email));
    }

    @PutMapping("/elementos/{elementoId}")
    public ResponseEntity<CursoService.ElementoDTO> editarElemento(
            @PathVariable Integer elementoId, @RequestBody CrearElementoRequest req, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.editarElemento(elementoId, req.getTitulo(), req.getContenido(), email));
    }

    @PostMapping("/secciones/{seccionId}/elementos")
    public ResponseEntity<CursoService.ElementoDTO> crearElemento(
            @PathVariable Integer seccionId, @RequestBody CrearElementoRequest req, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(cursoService.crearElemento(seccionId, req.getTipo(), req.getTitulo(), req.getContenido(), email));
    }

    @DeleteMapping("/elementos/{elementoId}")
    public ResponseEntity<Void> eliminarElemento(@PathVariable Integer elementoId, HttpServletRequest request) {
        String email = emailFromRequest(request);
        if (email == null) return ResponseEntity.status(401).build();
        cursoService.eliminarElemento(elementoId, email);
        return ResponseEntity.noContent().build();
    }

    @Data static class CrearCursoRequest { String nombre; String descripcion; String color; }
    @Data static class CrearElementoRequest { String tipo; String titulo; String contenido; }
}
