package com.quizsloth.controller;

import com.quizsloth.security.JwtUtil;
import com.quizsloth.servidor.Cliente;
import com.quizsloth.servidor.Servidor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
public class SalaController {

    private final Servidor servidor;
    private final Cliente cliente;
    private final JwtUtil jwtUtil;

    public SalaController(Servidor servidor, Cliente cliente, JwtUtil jwtUtil) {
        this.servidor = servidor;
        this.cliente = cliente;
        this.jwtUtil = jwtUtil;
    }

    // Extrae el email del JWT del encabezado Authorization
    private String emailFromRequest(HttpServletRequest req) {
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) {
            try { return jwtUtil.extractEmail(h.substring(7)); } catch (Exception ignored) {}
        }
        return null;
    }

    // Extrae el email de un token JWT recibido directamente (mensajes WebSocket)
    private String emailFromToken(String token) {
        if (token == null || token.isBlank()) return null;
        try { return jwtUtil.extractEmail(token.startsWith("Bearer ") ? token.substring(7) : token); }
        catch (Exception e) { return null; }
    }


    // POST /salas - Crea una sala de juego para el quiz indicado
    @PostMapping("/salas")
    @ResponseBody
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body, HttpServletRequest req) {
        String email = emailFromRequest(req);
        if (email == null) return ResponseEntity.status(401).build();
        Integer quizId = (Integer) body.get("quizId");
        boolean participar = Boolean.TRUE.equals(body.get("participar"));
        try {
            return ResponseEntity.ok(servidor.crearSala(quizId, email, participar));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET /salas/{codigo} - Devuelve el estado actual de la sala
    @GetMapping("/salas/{codigo}")
    @ResponseBody
    public ResponseEntity<?> info(@PathVariable String codigo) {
        try {
            return ResponseEntity.ok(servidor.getInfo(codigo));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // POST /salas/{codigo}/unirse - Une al jugador a la sala con el nickname indicado
    @PostMapping("/salas/{codigo}/unirse")
    @ResponseBody
    public ResponseEntity<?> unirse(@PathVariable String codigo,
                                     @RequestBody Map<String, String> body,
                                     HttpServletRequest req) {
        String email = emailFromRequest(req);
        String nickname = body.get("nickname");
        try {
            return ResponseEntity.ok(cliente.unirse(codigo, nickname, email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // POST /salas/solo/calificacion - Guarda la puntuación de una partida en modo individual
    @PostMapping("/salas/solo/calificacion")
    @ResponseBody
    public ResponseEntity<?> guardarCalificacionSolo(@RequestBody Map<String, Object> body,
                                                      HttpServletRequest req) {
        String email = emailFromRequest(req);
        Integer quizId = (Integer) body.get("quizId");
        int puntos = (int) body.get("puntos");
        int total = (int) body.get("totalPreguntas");
        try {
            servidor.guardarCalificacionSolo(quizId, email, puntos, total);
            return ResponseEntity.ok(Map.of("ok", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    // WS /sala/{codigo}/iniciar - Inicia el juego (solo el host puede iniciar)
    @MessageMapping("/sala/{codigo}/iniciar")
    public void iniciar(@DestinationVariable String codigo, @Payload Map<String, String> payload) {
        String email = emailFromToken(payload.get("token"));
        if (email == null) return;
        try { servidor.iniciar(codigo, email); } catch (Exception ignored) {}
    }

    // WS /sala/{codigo}/responder - Registra la respuesta de un participante
    @MessageMapping("/sala/{codigo}/responder")
    public void responder(@DestinationVariable String codigo, @Payload Map<String, Object> payload) {
        Long participanteId = Long.valueOf(payload.get("participanteId").toString());
        String respuesta = (String) payload.get("respuesta");
        try { cliente.responder(codigo, participanteId, respuesta); } catch (Exception ignored) {}
    }

    // WS /sala/{codigo}/siguiente - Avanza a la siguiente pregunta o termina la partida
    @MessageMapping("/sala/{codigo}/siguiente")
    public void siguiente(@DestinationVariable String codigo, @Payload Map<String, String> payload) {
        String email = emailFromToken(payload.get("token"));
        if (email == null) return;
        try { servidor.siguiente(codigo, email); } catch (Exception ignored) {}
    }

    // WS /sala/{codigo}/revelar - Revela el resultado de la pregunta actual sin avanzar
    @MessageMapping("/sala/{codigo}/revelar")
    public void revelar(@DestinationVariable String codigo, @Payload Map<String, String> payload) {
        String email = emailFromToken(payload.get("token"));
        if (email == null) return;
        try { servidor.revelarResultado(codigo, email); } catch (Exception ignored) {}
    }
}
