package com.quizsloth.controller;

import com.quizsloth.dto.AuthResponse;
import com.quizsloth.dto.LoginRequest;
import com.quizsloth.dto.RegisterRequest;
import com.quizsloth.dto.SubscripcionDTO;
import com.quizsloth.security.JwtUtil;
import com.quizsloth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    private String emailFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try { return jwtUtil.extractEmail(header.substring(7)); } catch (Exception ignored) {}
        }
        return null;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me/subscripcion")
    public ResponseEntity<SubscripcionDTO> getSubscripcion(HttpServletRequest request) {
        return ResponseEntity.ok(authService.getSubscripcion(emailFromRequest(request)));
    }

    @PostMapping("/me/subscripcion")
    public ResponseEntity<Void> reactivarSubscripcion(HttpServletRequest request) {
        authService.reactivarSubscripcion(emailFromRequest(request));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/subscripcion")
    public ResponseEntity<Void> cancelarSubscripcion(HttpServletRequest request) {
        authService.cancelarSubscripcion(emailFromRequest(request));
        return ResponseEntity.noContent().build();
    }
}
