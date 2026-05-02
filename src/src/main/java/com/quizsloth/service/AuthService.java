package com.quizsloth.service;

import com.quizsloth.dto.AuthResponse;
import com.quizsloth.dto.LoginRequest;
import com.quizsloth.dto.RegisterRequest;
import com.quizsloth.dto.SubscripcionDTO;
import com.quizsloth.model.Usuario;
import com.quizsloth.repository.UsuarioRepository;
import com.quizsloth.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final OdooService odooService;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String token = jwtUtil.generateToken(usuario.getEmail());
        return AuthResponse.from(usuario, token);
    }

    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setRol(request.getRol());

        Usuario saved = usuarioRepository.save(usuario);

        //  registrar en Odoo si es alumno
        if (saved.getRol() == Usuario.Rol.alumno) {
            try {
                Integer odooId = odooService.crearCliente(saved);
                saved.setOdooId(odooId);
                saved = usuarioRepository.save(saved);
            } catch (Exception e) {
                // El registro no debe fallar si Odoo no está disponible
                System.err.println("Odoo no disponible: " + e.getMessage());
            }
        }

        String token = jwtUtil.generateToken(saved.getEmail());
        return AuthResponse.from(saved, token);
    }

    public void reactivarSubscripcion(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getOdooId() == null) {
            throw new RuntimeException("Este usuario no tiene partner en Odoo");
        }

        try {
            odooService.reactivarSubscripcion(usuario.getOdooId());
        } catch (Exception e) {
            throw new RuntimeException("No se pudo reactivar la suscripcion: " + e.getMessage());
        }
    }

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

    public SubscripcionDTO getSubscripcion(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

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
