package com.quizsloth.servidor;

import com.quizsloth.model.*;
import com.quizsloth.repositoryDAO.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@Transactional
public class Servidor {

    private final SalaRepository salaRepository;
    private final SalaParticipanteRepository participanteRepository;
    private final QuizRepository quizRepository;
    private final PreguntaRepository preguntaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CalificacionRepository calificacionRepository;
    private final SimpMessagingTemplate broker;

    public Servidor(SalaRepository salaRepository,
                    SalaParticipanteRepository participanteRepository,
                    QuizRepository quizRepository,
                    PreguntaRepository preguntaRepository,
                    UsuarioRepository usuarioRepository,
                    CalificacionRepository calificacionRepository,
                    SimpMessagingTemplate broker) {
        this.salaRepository = salaRepository;
        this.participanteRepository = participanteRepository;
        this.quizRepository = quizRepository;
        this.preguntaRepository = preguntaRepository;
        this.usuarioRepository = usuarioRepository;
        this.calificacionRepository = calificacionRepository;
        this.broker = broker;
    }


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


    // Crea una nueva sala para el quiz; añade al host como jugador si participar=true
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

    // Cambia el estado de la sala a JUGANDO y envía la primera pregunta por WebSocket
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

    // Avanza a la siguiente pregunta o finaliza la sala enviando el podio si era la última
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

    // Envía la respuesta correcta y la clasificación actual sin avanzar de pregunta
    public void revelarResultado(String codigo, String hostEmail) {
        Sala sala = getSala(codigo);
        verificarHost(sala, hostEmail);
        List<Pregunta> preguntas = preguntaRepository.findByQuizIdOrderByOrden(sala.getQuiz().getId());
        enviarResultado(sala, preguntas.get(sala.getPreguntaActualIdx()));
    }

    // Devuelve el estado actual de la sala como DTO
    public SalaInfoDTO getInfo(String codigo) {
        return toSalaInfo(getSala(codigo));
    }

    // Guarda la nota de una partida en solitario calculada sobre el total de puntos posibles
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


    // Recupera la sala por código o lanza excepción si no existe
    Sala getSala(String codigo) {
        return salaRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada: " + codigo));
    }

    // Publica la respuesta correcta y la clasificación actual por WebSocket
    void enviarResultado(Sala sala, Pregunta pregunta) {
        List<JugadorDTO> jugadores = sala.getParticipantes().stream()
                .map(p -> new JugadorDTO(p.getId(), p.getNickname(), p.getPuntos(), p.isRespondioActual()))
                .sorted(Comparator.comparingInt(JugadorDTO::puntos).reversed())
                .toList();
        broker.convertAndSend("/topic/sala/" + sala.getCodigo() + "/resultado",
                new ResultadoPreguntaDTO(pregunta.getRespuestaCorrecta(), jugadores));
    }

    // Convierte la entidad Sala en el DTO para respuestas REST y mensajes WebSocket
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


    // Persiste la nota de cada participante con usuario al terminar la partida multijugador
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

    // Limpia el estado de respuesta de todos los jugadores para la siguiente pregunta
    private void resetRespuestas(Sala sala) {
        sala.getParticipantes().forEach(p -> {
            p.setRespondioActual(false);
            p.setRespuestaActual(null);
        });
    }

    // Verifica que el email es el del host de la sala, lanza excepción si no
    private void verificarHost(Sala sala, String email) {
        if (!sala.getHost().getEmail().equals(email))
            throw new RuntimeException("Solo el host puede realizar esta accion");
    }

    // Genera un código único de 6 caracteres para identificar la sala
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

    // Convierte una Pregunta en el DTO para enviarla por WebSocket
    private PreguntaWsDTO toPreguntaWs(Pregunta p, int idx, int total) {
        return new PreguntaWsDTO(idx, total, p.getEnunciado(),
                p.getOpcionA(), p.getOpcionB(), p.getOpcionC(), p.getOpcionD(),
                Math.round(p.getPeso().floatValue() * 100),
                p.getSegundos() != null ? p.getSegundos() : 30);
    }

    // Construye el podio final con todos los participantes ordenados por puntos
    private PodioDTO toPodio(Sala sala) {
        List<JugadorDTO> todos = sala.getParticipantes().stream()
                .map(p -> new JugadorDTO(p.getId(), p.getNickname(), p.getPuntos(), true))
                .sorted(Comparator.comparingInt(JugadorDTO::puntos).reversed())
                .toList();
        return new PodioDTO(todos.stream().limit(3).toList(), todos);
    }
}
