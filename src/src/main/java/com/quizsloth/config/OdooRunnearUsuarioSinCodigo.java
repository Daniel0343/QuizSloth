package com.quizsloth.config;

import com.quizsloth.model.Usuario;
import com.quizsloth.repositoryDAO.UsuarioRepository;
import com.quizsloth.service.OdooService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class OdooRunnearUsuarioSinCodigo implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(OdooRunnearUsuarioSinCodigo.class);

    private final UsuarioRepository usuarioRepository;
    private final OdooService odooService;

    public OdooRunnearUsuarioSinCodigo(UsuarioRepository usuarioRepository, OdooService odooService) {
        this.usuarioRepository = usuarioRepository;
        this.odooService = odooService;
    }

    // Al arrancar el backend, sincroniza con Odoo todos los usuarios que no tienen odooId asignado
    @Override
    public void run(String... args) {
        List<Usuario> sinSincronizar = usuarioRepository.findAll().stream()
                .filter(u -> u.getOdooId() == null)
                .filter(u -> u.getRol() == Usuario.Rol.profesor || u.getRol() == Usuario.Rol.alumno)
                .toList();

        if (sinSincronizar.isEmpty()) return;

        log.info("Sincronizando {} usuario(s) con Odoo...", sinSincronizar.size());

        for (Usuario usuario : sinSincronizar) {
            try {
                Integer odooId = odooService.crearCliente(usuario);
                usuario.setOdooId(odooId);
                usuarioRepository.save(usuario);
                log.info("Usuario {} sincronizado con Odoo (ID={})", usuario.getEmail(), odooId);
            } catch (Exception e) {
                log.warn("No se pudo sincronizar {} con Odoo: {}", usuario.getEmail(), e.getMessage());
            }
        }
    }
}
