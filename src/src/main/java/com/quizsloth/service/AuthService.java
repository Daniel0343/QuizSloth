package com.quizsloth.service;

import com.quizsloth.dto.ActualizarPerfilRequest;
import com.quizsloth.dto.AuthResponse;
import com.quizsloth.dto.LoginRequest;
import com.quizsloth.dto.RegisterRequest;
import com.quizsloth.dto.SubscripcionDTO;
import com.quizsloth.model.Usuario;
import com.quizsloth.repositoryDAO.UsuarioRepository;
import com.quizsloth.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;
    private final OdooService odooService;

    public AuthService(UsuarioRepository usuarioRepository, JwtUtil jwtUtil, OdooService odooService) {
        this.usuarioRepository = usuarioRepository;
        this.jwtUtil = jwtUtil;
        this.odooService = odooService;
    }

    // Actualiza el nombre y/o contraseña del usuario autenticado
    public AuthResponse.UserDTO actualizarPerfil(String email, ActualizarPerfilRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (request.getNombre() != null && !request.getNombre().isBlank()) {
            usuario.setNombre(request.getNombre().trim());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPassword(request.getPassword());
        }

        Usuario saved = usuarioRepository.save(usuario);
        return new AuthResponse.UserDTO(
                saved.getId(), saved.getNombre(), saved.getEmail(),
                saved.getRol().name(), saved.getOdooId(), saved.getFechaRegistro()
        );
    }

    // Autentica al usuario con email y contraseña y devuelve un token JWT
    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));

        if (!request.getPassword().equals(usuario.getPassword())) {
            throw new RuntimeException("Credenciales incorrectas");
        }

        String token = jwtUtil.generateToken(usuario.getEmail());
        return AuthResponse.from(usuario, token);
    }

    // Registra un nuevo usuario, lo sincroniza con Odoo y devuelve token JWT
    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(request.getPassword());
        usuario.setRol(request.getRol());

        Usuario saved = usuarioRepository.save(usuario);

        if (saved.getRol() == Usuario.Rol.alumno || saved.getRol() == Usuario.Rol.profesor) {
            try {
                Integer odooId = odooService.crearCliente(saved);
                saved.setOdooId(odooId);
                saved = usuarioRepository.save(saved);
            } catch (Exception e) {
                System.err.println("Odoo no disponible: " + e.getMessage());
            }
        }

        String token = jwtUtil.generateToken(saved.getEmail());
        return AuthResponse.from(saved, token);
    }

    // Reactiva la suscripción del profesor creando una nueva factura en Odoo
    public void reactivarSubscripcion(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getOdooId() == null) {
            try {
                Integer odooId = odooService.crearCliente(usuario);
                usuario.setOdooId(odooId);
                usuario = usuarioRepository.save(usuario);
            } catch (Exception e) {
                throw new RuntimeException("No se pudo sincronizar el usuario con Odoo: " + e.getMessage());
            }
        }

        try {
            odooService.reactivarSubscripcion(usuario.getOdooId());
        } catch (Exception e) {
            throw new RuntimeException("No se pudo reactivar la suscripcion: " + e.getMessage());
        }
    }

    // Cancela el pedido activo del usuario en Odoo
    public void cancelarSubscripcion(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getOdooId() == null) {
            throw new RuntimeException("Este usuario no tiene suscripción en Odoo");
        }

        try {
            odooService.cancelarSubscripcion(usuario.getOdooId());
        } catch (Exception e) {
            throw new RuntimeException("No se pudo cancelar la suscripción: " + e.getMessage());
        }
    }

    // Consulta el estado de suscripción del usuario desde Odoo, creando el cliente si no existe
    public SubscripcionDTO getSubscripcion(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getOdooId() == null && usuario.getRol() == Usuario.Rol.profesor) {
            try {
                Integer odooId = odooService.crearCliente(usuario);
                usuario.setOdooId(odooId);
                usuarioRepository.save(usuario);
            } catch (Exception e) {
                log.warn("No se pudo sincronizar profesor {} con Odoo: {}", email, e.getMessage());
                return new SubscripcionDTO("sin_subscripcion", null, null, null, null);
            }
        }

        if (usuario.getOdooId() == null) {
            return new SubscripcionDTO("sin_subscripcion", null, null, null, null);
        }

        try {
            return odooService.getSubscripcion(usuario.getOdooId());
        } catch (Exception e) {
            log.warn("No se pudo consultar Odoo para usuario {}: {}", email, e.getMessage());
            return new SubscripcionDTO("sin_subscripcion", null, null, null, null);
        }
    }
}
