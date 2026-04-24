package com.quizsloth.service;

import com.quizsloth.model.Apunte;
import com.quizsloth.model.Usuario;
import com.quizsloth.repository.ApunteRepository;
import com.quizsloth.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApunteService {

    private final ApunteRepository apunteRepository;
    private final UsuarioRepository usuarioRepository;
    private final IAService iaService;

    public record ApunteResumenDTO(Integer id, String titulo, String fechaCreacion) {}

    public record GenerarApunteRequest(String texto) {}
    public record ActualizarApunteRequest(String titulo, String contenidoJson) {}

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

    public Apunte generarDesdeArchivo(byte[] bytes, String tipoArchivo, String email) throws Exception {
        String texto;
        if (tipoArchivo.contains("pdf")) {
            texto = iaService.extraerTextoPDF(bytes);
        } else {
            texto = iaService.extraerTextoPPTX(bytes);
        }
        return generarDesdeTexto(texto, email);
    }

    public List<ApunteResumenDTO> listarPorUsuario(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return apunteRepository.findByUsuarioOrderByFechaCreacionDesc(usuario).stream()
                .map(a -> new ApunteResumenDTO(a.getId(), a.getTitulo(),
                        a.getFechaCreacion() != null ? a.getFechaCreacion().toString() : ""))
                .toList();
    }

    public Apunte obtener(Integer id, String email) {
        Apunte apunte = apunteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apunte no encontrado"));
        if (!apunte.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No tienes permiso");
        }
        return apunte;
    }

    public Apunte obtenerParaLectura(Integer id) {
        return apunteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apunte no encontrado"));
    }

    public Apunte actualizar(Integer id, String titulo, String contenidoJson, String email) {
        Apunte apunte = obtener(id, email);
        apunte.setTitulo(titulo);
        apunte.setContenidoJson(contenidoJson);
        return apunteRepository.save(apunte);
    }

    public void eliminar(Integer id, String email) {
        Apunte apunte = obtener(id, email);
        apunteRepository.delete(apunte);
    }

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
