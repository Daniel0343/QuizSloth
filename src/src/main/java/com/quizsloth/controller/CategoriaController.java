package com.quizsloth.controller;

import com.quizsloth.model.Categoria;
import com.quizsloth.repositoryDAO.CategoriaRepository;
import com.quizsloth.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;
    private final JwtUtil jwtUtil;

    public CategoriaController(CategoriaRepository categoriaRepository, JwtUtil jwtUtil) {
        this.categoriaRepository = categoriaRepository;
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

    // GET /categorias - Lista todas las categorías disponibles
    @GetMapping
    public ResponseEntity<List<Categoria>> getAll() {
        return ResponseEntity.ok(categoriaRepository.findAll());
    }

    // POST /categorias - Crea una nueva categoría si el nombre no está ya en uso
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

    // DELETE /categorias/{id} - Elimina una categoría, solo la puede borrar quien la creó
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
