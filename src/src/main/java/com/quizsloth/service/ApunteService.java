package com.quizsloth.service;

import com.quizsloth.model.Apunte;
import com.quizsloth.model.Usuario;
import com.quizsloth.repositoryDAO.ApunteRepository;
import com.quizsloth.repositoryDAO.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApunteService {

    private final ApunteRepository apunteRepository;
    private final UsuarioRepository usuarioRepository;
    private final IAService iaService;

    public ApunteService(ApunteRepository apunteRepository,
                         UsuarioRepository usuarioRepository,
                         IAService iaService) {
        this.apunteRepository = apunteRepository;
        this.usuarioRepository = usuarioRepository;
        this.iaService = iaService;
    }

    public record ApunteResumenDTO(Integer id, String titulo, String fechaCreacion) {}

    public record GenerarApunteRequest(String texto) {}
    public record ActualizarApunteRequest(String titulo, String contenidoJson) {}

    // Genera apuntes estructurados en JSON con IA a partir de texto libre y los guarda
    public Apunte generarDesdeTexto(String texto, String email) {
        String contenidoJson = iaService.generarApuntesDesdeTexto(texto);
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String titulo = extraerTitulo(contenidoJson);
        Apunte apunte = new Apunte();
        apunte.setTitulo(titulo);
        apunte.setContenidoJson(contenidoJson);
        apunte.setUsuario(usuario);
        return apunteRepository.save(apunte);
    }

    // Extrae el texto de un PDF y genera apuntes con IA
    public Apunte generarDesdeArchivo(byte[] bytes, String tipoArchivo, String email) throws Exception {
        if (!tipoArchivo.contains("pdf")) {
            throw new RuntimeException("Solo se admiten archivos PDF");
        }
        String texto = iaService.extraerTextoPDF(bytes);
        return generarDesdeTexto(texto, email);
    }

    // Lista los apuntes del usuario ordenados del más reciente al más antiguo
    public List<ApunteResumenDTO> listarPorUsuario(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return apunteRepository.findByUsuarioOrderByFechaCreacionDesc(usuario).stream()
                .map(a -> new ApunteResumenDTO(a.getId(), a.getTitulo(),
                        a.getFechaCreacion() != null ? a.getFechaCreacion().toString() : ""))
                .toList();
    }

    // Obtiene un apunte verificando que pertenece al usuario autenticado
    public Apunte obtener(Integer id, String email) {
        Apunte apunte = apunteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apunte no encontrado"));
        if (!apunte.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No tienes permiso");
        }
        return apunte;
    }

    // Obtiene un apunte sin verificar propiedad (para lectura compartida desde cursos)
    public Apunte obtenerParaLectura(Integer id) {
        return apunteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apunte no encontrado"));
    }

    // Actualiza el título y el contenido JSON de un apunte
    public Apunte actualizar(Integer id, String titulo, String contenidoJson, String email) {
        Apunte apunte = obtener(id, email);
        apunte.setTitulo(titulo);
        apunte.setContenidoJson(contenidoJson);
        return apunteRepository.save(apunte);
    }

    // Elimina un apunte del usuario autenticado
    public void eliminar(Integer id, String email) {
        Apunte apunte = obtener(id, email);
        apunteRepository.delete(apunte);
    }

    // Extrae el campo "titulo" del JSON devuelto por la IA
    private String extraerTitulo(String json) {
        try {
            int idx = json.indexOf("\"titulo\"");
            if (idx == -1) return "Apuntes";
            int colon = json.indexOf(":", idx);
            int q1 = json.indexOf("\"", colon + 1);
            int q2 = json.indexOf("\"", q1 + 1);
            return json.substring(q1 + 1, q2);
        } catch (Exception e) {
            return "Apuntes";
        }
    }
}
