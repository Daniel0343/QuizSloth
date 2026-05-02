package com.quizsloth.servidor;

import com.quizsloth.model.*;
import com.quizsloth.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class Cliente {

    private final SalaParticipanteRepository participanteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PreguntaRepository preguntaRepository;
    private final SimpMessagingTemplate broker;
    private final Servidor servidor;

    public Servidor.UnirseResponseDTO unirse(String codigo, String nickname, String email) {
        Sala sala = servidor.getSala(codigo);
        if (sala.getEstado() == Sala.Estado.TERMINADA)
            throw new RuntimeException("La sala ha terminado");

        Usuario usuario = email != null ? usuarioRepository.findByEmail(email).orElse(null) : null;

        SalaParticipante p = new SalaParticipante();
        p.setSala(sala);
        p.setUsuario(usuario);
        p.setNickname(nickname != null && !nickname.isBlank() ? nickname
                : (usuario != null ? usuario.getNombre().split(" ")[0] : "Invitado"));
        p = participanteRepository.save(p);
        sala.getParticipantes().add(p);

        Servidor.SalaInfoDTO info = servidor.toSalaInfo(sala);
        broker.convertAndSend("/topic/sala/" + codigo + "/jugadores", info.jugadores());
        return new Servidor.UnirseResponseDTO(p.getId(), info);
    }

    public void responder(String codigo, Long participanteId, String respuesta) {
        Sala sala = servidor.getSala(codigo);
        if (sala.getEstado() != Sala.Estado.JUGANDO) return;

        SalaParticipante p = sala.getParticipantes().stream()
                .filter(x -> x.getId().equals(participanteId))
                .findFirst().orElseThrow();

        if (p.isRespondioActual()) return;

        List<Pregunta> preguntas = preguntaRepository.findByQuizIdOrderByOrden(sala.getQuiz().getId());
        Pregunta pregunta = preguntas.get(sala.getPreguntaActualIdx());

        p.setRespondioActual(true);
        p.setRespuestaActual(respuesta);

        if (pregunta.getRespuestaCorrecta().equalsIgnoreCase(respuesta)) {
            int pts = Math.round(pregunta.getPeso().floatValue() * 100);
            p.setPuntos(p.getPuntos() + pts);
        }

        long respondidos = sala.getParticipantes().stream().filter(SalaParticipante::isRespondioActual).count();
        broker.convertAndSend("/topic/sala/" + codigo + "/progreso",
                Map.of("respondidos", respondidos, "total", sala.getParticipantes().size()));

        if (respondidos == sala.getParticipantes().size()) {
            servidor.enviarResultado(sala, pregunta);
        }
    }
}
