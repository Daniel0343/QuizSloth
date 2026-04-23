package com.quizsloth.controller;

import com.quizsloth.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class FileController {

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final JwtUtil jwtUtil;

    private boolean isAuthenticated(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) return false;
        try { jwtUtil.extractEmail(header.substring(7)); return true; } catch (Exception e) { return false; }
    }

    @PostMapping("/files/upload")
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
        if (!isAuthenticated(request)) return ResponseEntity.status(401).body(Map.of("error", "No autorizado"));
        try {
            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "archivo.pdf";
            String nombreSanitizado = original.replaceAll("[^a-zA-Z0-9._-]", "_");
            String uuid = UUID.randomUUID().toString();
            Path dest = Path.of(uploadDir + "/pdfs/" + uuid + "/" + nombreSanitizado);
            Files.createDirectories(dest.getParent());
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok(Map.of("url", uuid + "/" + nombreSanitizado));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "No se pudo subir el archivo"));
        }
    }

    @GetMapping("/files/{uuid}/{nombre}")
    public ResponseEntity<Resource> serve(@PathVariable String uuid, @PathVariable String nombre) throws MalformedURLException {
        Path path = Path.of(uploadDir + "/pdfs/" + uuid + "/" + nombre);
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists()) return ResponseEntity.notFound().build();
        String contentType = nombre.endsWith(".pdf") ? "application/pdf" : "application/octet-stream";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nombre + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    // Compatibilidad con URLs antiguas (uuid.pdf sin carpeta)
    @GetMapping("/files/{nombre}")
    public ResponseEntity<Resource> serveLegacy(@PathVariable String nombre) throws MalformedURLException {
        Path path = Path.of(uploadDir + "/pdfs/" + nombre);
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists()) return ResponseEntity.notFound().build();
        String contentType = nombre.endsWith(".pdf") ? "application/pdf" : "application/octet-stream";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + nombre + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}
