package com.quizsloth.controller;

import com.quizsloth.dto.AuthResponse;
import com.quizsloth.dto.LoginRequest;
import com.quizsloth.dto.RegisterRequest;
import com.quizsloth.dto.SubscripcionDTO;
import com.quizsloth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me/subscripcion")
    public ResponseEntity<SubscripcionDTO> getSubscripcion(Authentication authentication) {
        return ResponseEntity.ok(authService.getSubscripcion(authentication.getName()));
    }
}
