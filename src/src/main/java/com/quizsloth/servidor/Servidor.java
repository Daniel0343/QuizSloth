package com.quizsloth.servidor;

import com.quizsloth.model.*;
import com.quizsloth.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional
@RequiredArgsConstructor
public class Servidor {

    private final SalaRepository salaRepository;
    private final SalaParticipanteRepository participanteRepository;
    private final QuizRepository quizRepository;
    private final PreguntaRepository preguntaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CalificacionRepository calificacionRepository;
    private final SimpMessagingTemplate broker;

    // ── DTOs ─────────────────────────────────────────────────────────────────

    public record JugadorDTO(Long id, String nickname, int puntos, boolean respondio) {}
    public record SalaInfoDTO(String codigo, String estado, int preguntaActualIdx,
                               int totalPreguntas, String quizTitulo, Long hostParticipanteId,
                               List<JugadorDTO> jugadores) {}
    public record PreguntaWsDTO(int idx, int total, String enunciado,
                                 String opcionA, String opcionB, String opcionC, String opcionD,
                                 int puntos, int segundos) {}
    public record ResultadoPreguntaDTO(String respuestaCorrecta, List<JugadorDTO> jugadores) {}
    public record PodioDTO(List<JugadorDTO> podio, List<JugadorDTO> todos) {}
    public record UnirseResponseDTO(Long participanteId, SalaInfoDTO sala) {}

    // ── Acciones del servidor (host) ──────────────────────────────────────────

    public SalaInfoDTO crearSala(Integer quizId, String hostEmail, boolean participar) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz no encontrado"));
        Usuario host = usuarioRepository.findByEmail(hostEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Sala sala = new Sala();
        sala.setCodigo(generarCodigo());
        sala.setQuiz(quiz);
        sala.setHost(host);

        if (participar) {
            SalaParticipante hostPart = new SalaParticipante();
            hostPart.setSala(sala);
            hostPart.setUsuario(host);
            hostPart.setNickname(host.getNombre().split(" ")[0]);
            sala.getParticipantes().add(hostPart);
        }

        sala = salaRepository.save(sala);
        return toSalaInfo(sala);
    }

    public void iniciar(String codigo, String hostEmail) {
        Sala sala = getSala(codigo);
        verificarHost(sala, hostEmail);
        if (sala.getEstado() != Sala.Estado.ESPERANDO)
            throw new RuntimeException("La sala ya está en juego o ha terminado");

        List<Pregunta> preguntas = preguntaRepository.findByQuizIdOrderByOrden(sala.getQuiz().getId());
        if (preguntas.isEmpty()) throw new RuntimeException("El quiz no tiene preguntas");

        sala.setEstado(Sala.Estado.JUGANDO);
        sala.setPreguntaActualIdx(0);
        resetRespuestas(sala);
        salaRepository.save(sala);

        broker.convertAndSend("/topic/sala/" + codigo + "/pregunta",
                toPreguntaWs(preguntas.get(0), 0, preguntas.size()));
    }

    public void siguiente(String codigo, String hostEmail) {
        Sala sala = getSala(codigo);
        verificarHost(sala, hostEmail);
        if (sala.getEstado() != Sala.Estado.JUGANDO) return;

        List<Pregunta> preguntas = preguntaRepository.findByQuizIdOrderByOrden(sala.getQuiz().getId());
        enviarResultado(sala, preguntas.get(sala.getPreguntaActualIdx()));

        int siguiente = sala.getPreguntaActualIdx() + 1;
        if (siguiente >= preguntas.size()) {
            sala.setEstado(Sala.Estado.TERMINADA);
            salaRepository.save(sala);
            guardarCalificaciones(sala, preguntas.size());
            broker.convertAndSend("/topic/sala/" + codigo + "/fin", toPodio(sala));
        } else {
            sala.setPreguntaActualIdx(siguiente);
            resetRespuestas(sala);
            salaRepository.save(sala);
            broker.convertAndSend("/topic/sala/" + codigo + "/pregunta",
                    toPreguntaWs(preguntas.get(siguiente), siguiente, preguntas.size()));
        }
    }

    public void revelarResultado(String codigo, String hostEmail) {
        Sala sala = getSala(codigo);
        verificarHost(sala, hostEmail);
        List<Pregunta> preguntas = preguntaRepository.findByQuizIdOrderByOrden(sala.getQuiz().getId());
        enviarResultado(sala, preguntas.get(sala.getPreguntaActualIdx()));
    }

    public SalaInfoDTO getInfo(String codigo) {
        return toSalaInfo(getSala(codigo));
    }

    public void guardarCalificacionSolo(Integer quizId, String email, int puntos, int totalPreguntas) {
        if (email == null) return;
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null) return;
        Quiz quiz = quizRepository.findById(quizId).orElse(null);
        if (quiz == null) return;

        BigDecimal nota = totalPreguntas > 0
                ? BigDecimal.valueOf(puntos).divide(BigDecimal.valueOf(totalPreguntas * 100L), 4, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.TEN)
                : BigDecimal.ZERO;

        Calificacion c = new Calificacion();
        c.setUsuario(usuario);
        c.setQuiz(quiz);
        c.setPuntuacion(nota.min(BigDecimal.TEN));
        calificacionRepository.save(c);
    }

    // ── Helpers accesibles desde Cliente (mismo paquete) ─────────────────────

    Sala getSala(String codigo) {
        return salaRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada: " + codigo));
    }

    void enviarResultado(Sala sala, Pregunta pregunta) {
        List<JugadorDTO> jugadores = sala.getParticipantes().stream()
                .map(p -> new JugadorDTO(p.getId(), p.getNickname(), p.getPuntos(), p.isRespondioActual()))
                .sorted(Comparator.comparingInt(JugadorDTO::puntos).reversed())
                .toList();
        broker.convertAndSend("/topic/sala/" + sala.getCodigo() + "/resultado",
                new ResultadoPreguntaDTO(pregunta.getRespuestaCorrecta(), jugadores));
    }

    SalaInfoDTO toSalaInfo(Sala sala) {
        List<Pregunta> preguntas = preguntaRepository.findByQuizIdOrderByOrden(sala.getQuiz().getId());
        Long hostPartId = sala.getParticipantes().stream()
                .filter(p -> p.getUsuario() != null && p.getUsuario().getEmail().equals(sala.getHost().getEmail()))
                .map(SalaParticipante::getId)
                .findFirst().orElse(null);
        return new SalaInfoDTO(
                sala.getCodigo(),
                sala.getEstado().name(),
                sala.getPreguntaActualIdx(),
                preguntas.size(),
                sala.getQuiz().getTitulo(),
                hostPartId,
                sala.getParticipantes().stream()
                        .map(p -> new JugadorDTO(p.getId(), p.getNickname(), p.getPuntos(), p.isRespondioActual()))
                        .toList()
        );
    }

    // ── Helpers privados ──────────────────────────────────────────────────────

    private void guardarCalificaciones(Sala sala, int totalPreguntas) {
        int maxPuntos = totalPreguntas * 100;
        for (SalaParticipante p : sala.getParticipantes()) {
            if (p.getUsuario() == null) continue;
            BigDecimal nota = maxPuntos > 0
                    ? BigDecimal.valueOf(p.getPuntos())
                        .divide(BigDecimal.valueOf(maxPuntos), 4, java.math.RoundingMode.HALF_UP)
                        .multiply(BigDecimal.TEN)
                    : BigDecimal.ZERO;
            Calificacion c = new Calificacion();
            c.setUsuario(p.getUsuario());
            c.setQuiz(sala.getQuiz());
            c.setPuntuacion(nota.min(BigDecimal.TEN));
            calificacionRepository.save(c);
        }
    }

    private void resetRespuestas(Sala sala) {
        sala.getParticipantes().forEach(p -> {
            p.setRespondioActual(false);
            p.setRespuestaActual(null);
        });
    }

    private void verificarHost(Sala sala, String email) {
        if (!sala.getHost().getEmail().equals(email))
            throw new RuntimeException("Solo el host puede realizar esta accion");
    }

    private String generarCodigo() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Random rnd = new Random();
        String codigo;
        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
            codigo = sb.toString();
        } while (salaRepository.existsByCodigo(codigo));
        return codigo;
    }

    private PreguntaWsDTO toPreguntaWs(Pregunta p, int idx, int total) {
        return new PreguntaWsDTO(idx, total, p.getEnunciado(),
                p.getOpcionA(), p.getOpcionB(), p.getOpcionC(), p.getOpcionD(),
                Math.round(p.getPeso().floatValue() * 100),
                p.getSegundos() != null ? p.getSegundos() : 30);
    }

    private PodioDTO toPodio(Sala sala) {
        List<JugadorDTO> todos = sala.getParticipantes().stream()
                .map(p -> new JugadorDTO(p.getId(), p.getNickname(), p.getPuntos(), true))
                .sorted(Comparator.comparingInt(JugadorDTO::puntos).reversed())
                .toList();
        return new PodioDTO(todos.stream().limit(3).toList(), todos);
    }
}
