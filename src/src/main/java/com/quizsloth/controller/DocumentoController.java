package com.quizsloth.controller;

import com.quizsloth.model.Documento;
import com.quizsloth.model.Usuario;
import com.quizsloth.repository.CursoRepository;
import com.quizsloth.repository.DocumentoRepository;
import com.quizsloth.repository.UsuarioRepository;
import com.quizsloth.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/documentos")
public class DocumentoController {

    private final DocumentoRepository documentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final JwtUtil jwtUtil;

    public DocumentoController(DocumentoRepository documentoRepository,
                               UsuarioRepository usuarioRepository,
                               CursoRepository cursoRepository,
                               JwtUtil jwtUtil) {
        this.documentoRepository = documentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.cursoRepository = cursoRepository;
        this.jwtUtil = jwtUtil;
    }

    @Value("${app.upload.dir}")
    private String uploadDir;

    private String emailFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try { return jwtUtil.extractEmail(header.substring(7)); } catch (Exception ignored) {}
        }
        return null;
    }

    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<Documento>> porCurso(@PathVariable Integer cursoId) {
        var curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        return ResponseEntity.ok(documentoRepository.findByCurso(curso));
    }

    /**
     * Sube un documento (PDF o texto) para un curso.
     */
    @PostMapping("/subir")
    public ResponseEntity<Documento> subir(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("cursoId") Integer cursoId,
            HttpServletRequest request) throws IOException {

        var curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        Usuario usuario = usuarioRepository.findByEmail(emailFromRequest(request))
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Guardar archivo en disco
        String nombreUnico = UUID.randomUUID() + "_" + archivo.getOriginalFilename();
        String ruta = "/cursos/" + cursoId + "/" + nombreUnico;
        Path destino = Path.of(uploadDir + ruta);
        Files.createDirectories(destino.getParent());
        Files.copy(archivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);

        Documento doc = new Documento();
        doc.setNombreArchivo(archivo.getOriginalFilename());
        doc.setRutaAlmacenamiento(ruta);
        doc.setCurso(curso);
        doc.setUsuario(usuario);

        return ResponseEntity.ok(documentoRepository.save(doc));
    }
}
