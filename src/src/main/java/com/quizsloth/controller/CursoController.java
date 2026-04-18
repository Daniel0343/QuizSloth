package com.quizsloth.controller;

import com.quizsloth.model.Curso;
import com.quizsloth.service.CursoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cursos")
@RequiredArgsConstructor
public class CursoController {

    private final CursoService cursoService;

    @GetMapping
    public ResponseEntity<List<Curso>> listar() {
        return ResponseEntity.ok(cursoService.listarTodos());
    }

    @GetMapping("/mis-cursos")
    public ResponseEntity<List<Curso>> misCursos(Authentication authentication) {
        return ResponseEntity.ok(cursoService.listarMisCursos(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Curso> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(cursoService.obtener(id));
    }

    @GetMapping("/profesor/{profesorId}")
    public ResponseEntity<List<Curso>> porProfesor(@PathVariable Integer profesorId) {
        return ResponseEntity.ok(cursoService.listarPorProfesor(profesorId));
    }

    @PostMapping
    public ResponseEntity<Curso> crear(@RequestBody Curso curso) {
        return ResponseEntity.ok(cursoService.crear(curso));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Curso> actualizar(@PathVariable Integer id, @RequestBody Curso datos) {
        return ResponseEntity.ok(cursoService.actualizar(id, datos));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        cursoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
