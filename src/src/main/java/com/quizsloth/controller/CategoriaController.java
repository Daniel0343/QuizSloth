package com.quizsloth.controller;

import com.quizsloth.model.Categoria;
import com.quizsloth.repository.CategoriaRepository;
import com.quizsloth.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;
    private final JwtUtil jwtUtil;

    private String emailFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try { return jwtUtil.extractEmail(header.substring(7)); } catch (Exception ignored) {}
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<Categoria>> getAll() {
        return ResponseEntity.ok(categoriaRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Categoria> crear(@RequestBody Categoria categoria, HttpServletRequest request) {
        if (categoria.getNombre() == null || categoria.getNombre().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (categoriaRepository.findByNombre(categoria.getNombre().trim()).isPresent()) {
            return ResponseEntity.status(409).build();
        }
        categoria.setNombre(categoria.getNombre().trim());
        categoria.setCreadoPorEmail(emailFromRequest(request));
        return ResponseEntity.ok(categoriaRepository.save(categoria));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id, HttpServletRequest request) {
        String email = emailFromRequest(request);
        var opt = categoriaRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Categoria cat = opt.get();
        if (email == null || !email.equals(cat.getCreadoPorEmail())) {
            return ResponseEntity.<Void>status(403).build();
        }
        categoriaRepository.deleteById(id);
        return ResponseEntity.<Void>noContent().build();
    }
}
