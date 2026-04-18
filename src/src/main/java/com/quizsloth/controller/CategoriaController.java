package com.quizsloth.controller;

import com.quizsloth.model.Categoria;
import com.quizsloth.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaRepository categoriaRepository;

    @GetMapping
    public ResponseEntity<List<Categoria>> getAll() {
        return ResponseEntity.ok(categoriaRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Categoria> crear(@RequestBody Categoria categoria) {
        if (categoria.getNombre() == null || categoria.getNombre().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (categoriaRepository.findByNombre(categoria.getNombre().trim()).isPresent()) {
            return ResponseEntity.status(409).build();
        }
        categoria.setNombre(categoria.getNombre().trim());
        return ResponseEntity.ok(categoriaRepository.save(categoria));
    }
}
