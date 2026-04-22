package com.quizsloth.servidor;

import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SalaManager {

    private final Map<String, Sala> salas = new ConcurrentHashMap<>();

    @Data
    public static class Sala {
        private String codigo;
        private Cliente host;
        private Integer quizId;
        private Estado estado = Estado.ESPERANDO;
        private int preguntaActual = 0;
        private final List<Jugador> jugadores = new ArrayList<>();

        public enum Estado { ESPERANDO, JUGANDO, FIN }

        @Data
        public static class Jugador {
            private final Cliente cliente;
            private final String nombre;
            private int puntos = 0;
        }
    }

    public Sala crearSala(Cliente host, String nombre, Integer quizId) {
        String codigo = generarCodigo();
        Sala sala = new Sala();
        sala.setCodigo(codigo);
        sala.setHost(host);
        sala.setQuizId(quizId);
        sala.getJugadores().add(new Sala.Jugador(host, nombre));
        salas.put(codigo, sala);
        return sala;
    }

    public Optional<Sala> getSala(String codigo) {
        return Optional.ofNullable(salas.get(codigo));
    }

    public void eliminarSala(String codigo) {
        salas.remove(codigo);
    }

    public void eliminarCliente(Cliente cliente) {
        salas.forEach((codigo, sala) -> {
            sala.getJugadores().removeIf(j -> j.getCliente() == cliente);
            if (sala.getJugadores().isEmpty()) {
                salas.remove(codigo);
            } else if (sala.getHost() == cliente) {
                sala.setHost(sala.getJugadores().get(0).getCliente());
                Mensaje nuevoHost = Mensaje.of(Mensaje.NUEVO_HOST);
                nuevoHost.setNombre(sala.getJugadores().get(0).getNombre());
                broadcast(sala, nuevoHost, null);
            }
            broadcast(sala, jugadoresMsg(sala), null);
        });
    }

    public void broadcast(Sala sala, Mensaje mensaje, Cliente excepto) {
        String json = mensaje.toJson();
        for (Sala.Jugador j : sala.getJugadores()) {
            if (j.getCliente() != excepto) j.getCliente().enviar(json);
        }
    }

    public void enviarATodos(Sala sala, Mensaje mensaje) {
        broadcast(sala, mensaje, null);
    }

    public Mensaje jugadoresMsg(Sala sala) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<Map<String, Object>> lista = new ArrayList<>();
            for (Sala.Jugador j : sala.getJugadores()) {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("nombre", j.getNombre());
                m.put("puntos", j.getPuntos());
                m.put("esHost", j.getCliente() == sala.getHost());
                lista.add(m);
            }
            Mensaje msg = Mensaje.of(Mensaje.JUGADORES);
            msg.setMensaje(mapper.writeValueAsString(lista));
            return msg;
        } catch (Exception e) {
            return Mensaje.of(Mensaje.JUGADORES);
        }
    }

    private String generarCodigo() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Random r = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 5; i++) sb.append(chars.charAt(r.nextInt(chars.length())));
        return sb.toString();
    }
}
