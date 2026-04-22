package com.quizsloth.servidor;

import java.io.*;
import java.net.Socket;

public class Cliente implements Runnable {

    private final Socket socket;
    private final Servidor servidor;
    private final SalaManager salaManager;
    private PrintWriter salida;
    private String nombre;

    public Cliente(Socket socket, Servidor servidor, SalaManager salaManager) {
        this.socket = socket;
        this.servidor = servidor;
        this.salaManager = salaManager;
    }

    @Override
    public void run() {
        try (
            BufferedReader entrada = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            PrintWriter out = new PrintWriter(socket.getOutputStream(), true)
        ) {
            this.salida = out;
            System.out.println("[+] Cliente conectado desde " + socket.getInetAddress());

            String linea;
            while ((linea = entrada.readLine()) != null) {
                Mensaje msg = Mensaje.parse(linea);
                if (msg == null) continue;
                procesarMensaje(msg);
            }

        } catch (IOException e) {
            System.out.println("[-] Conexión cerrada: " + (nombre != null ? nombre : socket.getInetAddress()));
        } finally {
            salaManager.eliminarCliente(this);
            servidor.eliminarCliente(this);
            try { socket.close(); } catch (IOException ignored) {}
        }
    }

    private void procesarMensaje(Mensaje msg) {
        switch (msg.getTipo()) {

            case Mensaje.CREAR_SALA -> {
                nombre = msg.getNombre();
                SalaManager.Sala sala = salaManager.crearSala(this, nombre, msg.getQuizId());
                Mensaje resp = Mensaje.of(Mensaje.SALA_CREADA);
                resp.setCodigo(sala.getCodigo());
                enviar(resp.toJson());
                System.out.println("Sala creada: " + sala.getCodigo() + " por " + nombre);
            }

            case Mensaje.UNIRSE_SALA -> {
                nombre = msg.getNombre();
                salaManager.getSala(msg.getCodigo()).ifPresentOrElse(sala -> {
                    if (sala.getEstado() != SalaManager.Sala.Estado.ESPERANDO) {
                        enviar(Mensaje.error("La partida ya ha comenzado").toJson());
                        return;
                    }
                    sala.getJugadores().add(new SalaManager.Sala.Jugador(this, nombre));
                    Mensaje resp = Mensaje.of(Mensaje.SALA_UNIDA);
                    resp.setCodigo(sala.getCodigo());
                    enviar(resp.toJson());
                    salaManager.enviarATodos(sala, salaManager.jugadoresMsg(sala));
                    System.out.println(nombre + " se unió a sala " + sala.getCodigo());
                }, () -> enviar(Mensaje.error("Sala no encontrada").toJson()));
            }

            case Mensaje.INICIAR_PARTIDA -> {
                salaManager.getSala(msg.getCodigo()).ifPresent(sala -> {
                    if (sala.getHost() != this) return;
                    sala.setEstado(SalaManager.Sala.Estado.JUGANDO);
                    sala.setPreguntaActual(0);
                    Mensaje resp = Mensaje.of(Mensaje.PARTIDA_INICIADA);
                    resp.setMensaje("0");
                    salaManager.enviarATodos(sala, resp);
                    System.out.println("Partida iniciada en sala " + sala.getCodigo());
                });
            }

            case Mensaje.RESPONDER -> {
                salaManager.getSala(msg.getCodigo()).ifPresent(sala -> {
                    sala.getJugadores().stream()
                        .filter(j -> j.getCliente() == this)
                        .findFirst()
                        .ifPresent(jugador -> {
                            if (Boolean.TRUE.equals(msg.getCorrecta())) {
                                int bonus = msg.getTiempo() != null ? Math.max(100, 1000 - msg.getTiempo() * 10) : 100;
                                jugador.setPuntos(jugador.getPuntos() + bonus);
                            }
                            salaManager.enviarATodos(sala, salaManager.jugadoresMsg(sala));
                        });
                });
            }

            case Mensaje.SIGUIENTE -> {
                salaManager.getSala(msg.getCodigo()).ifPresent(sala -> {
                    if (sala.getHost() != this) return;
                    sala.setPreguntaActual(sala.getPreguntaActual() + 1);
                    Mensaje resp = Mensaje.of(Mensaje.NUEVA_PREGUNTA);
                    resp.setMensaje(String.valueOf(sala.getPreguntaActual()));
                    salaManager.enviarATodos(sala, resp);
                });
            }

            case Mensaje.FINALIZAR -> {
                salaManager.getSala(msg.getCodigo()).ifPresent(sala -> {
                    if (sala.getHost() != this) return;
                    sala.setEstado(SalaManager.Sala.Estado.FIN);
                    Mensaje resp = Mensaje.of(Mensaje.PARTIDA_FINALIZADA);
                    salaManager.enviarATodos(sala, resp);
                    salaManager.eliminarSala(sala.getCodigo());
                    System.out.println("Sala " + sala.getCodigo() + " finalizada");
                });
            }

            default -> System.out.println("Mensaje desconocido: " + msg.getTipo());
        }
    }

    public void enviar(String json) {
        if (salida != null) salida.println(json);
    }

    public String getNombre() {
        return nombre;
    }
}
