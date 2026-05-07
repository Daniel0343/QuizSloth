package com.quizsloth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "sala_participantes")
public class SalaParticipante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sala", nullable = false)
    private Sala sala;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario; // null para invitados

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(nullable = false)
    private int puntos = 0;

    @Column(name = "respondio_actual", nullable = false)
    private boolean respondioActual = false;

    @Column(name = "respuesta_actual", length = 1)
    private String respuestaActual;

    public SalaParticipante() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Sala getSala() { return sala; }
    public void setSala(Sala sala) { this.sala = sala; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public int getPuntos() { return puntos; }
    public void setPuntos(int puntos) { this.puntos = puntos; }

    public boolean isRespondioActual() { return respondioActual; }
    public void setRespondioActual(boolean respondioActual) { this.respondioActual = respondioActual; }

    public String getRespuestaActual() { return respuestaActual; }
    public void setRespuestaActual(String respuestaActual) { this.respuestaActual = respuestaActual; }
}
