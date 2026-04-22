package com.quizsloth.servidor;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
@RequiredArgsConstructor
public class Servidor {

    private static final int PUERTO = 4000;

    private final SalaManager salaManager;
    private ServerSocket serverSocket;
    private final ExecutorService hilos = Executors.newCachedThreadPool();
    private final List<Cliente> clientes = new CopyOnWriteArrayList<>();

    @PostConstruct
    public void iniciar() {
        new Thread(() -> {
            try {
                serverSocket = new ServerSocket(PUERTO);
                System.out.println("=== Servidor de sockets escuchando en puerto " + PUERTO + " ===");

                while (!serverSocket.isClosed()) {
                    Socket socket = serverSocket.accept();
                    Cliente cliente = new Cliente(socket, this, salaManager);
                    clientes.add(cliente);
                    hilos.execute(cliente);
                }
            } catch (IOException e) {
                if (!serverSocket.isClosed()) {
                    System.err.println("Error en el servidor de sockets: " + e.getMessage());
                }
            }
        }, "servidor-socket-hilo").start();
    }

    @PreDestroy
    public void detener() {
        try {
            hilos.shutdownNow();
            if (serverSocket != null) serverSocket.close();
            System.out.println("Servidor de sockets detenido.");
        } catch (IOException e) {
            System.err.println("Error al cerrar el servidor: " + e.getMessage());
        }
    }

    public void broadcast(String mensaje, Cliente emisor) {
        for (Cliente c : clientes) {
            if (c != emisor) c.enviar(mensaje);
        }
    }

    public void broadcast(String mensaje) {
        for (Cliente c : clientes) c.enviar(mensaje);
    }

    public void eliminarCliente(Cliente cliente) {
        clientes.remove(cliente);
        broadcast(">> " + cliente.getNombre() + " ha salido.", cliente);
        System.out.println("Clientes conectados: " + clientes.size());
    }

    public List<Cliente> getClientes() {
        return clientes;
    }
}
