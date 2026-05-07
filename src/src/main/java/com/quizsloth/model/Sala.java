package com.quizsloth.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "salas")
public class Sala {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 8)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Estado estado = Estado.ESPERANDO;

    @Column(name = "pregunta_actual_idx")
    private int preguntaActualIdx = -1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_quiz", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_host", nullable = false)
    private Usuario host;

    @OneToMany(mappedBy = "sala", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<SalaParticipante> participantes = new ArrayList<>();

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    public Sala() {}

    @PrePersist
    void onCreate() { fechaCreacion = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public Estado getEstado() { return estado; }
    public void setEstado(Estado estado) { this.estado = estado; }

    public int getPreguntaActualIdx() { return preguntaActualIdx; }
    public void setPreguntaActualIdx(int preguntaActualIdx) { this.preguntaActualIdx = preguntaActualIdx; }

    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }

    public Usuario getHost() { return host; }
    public void setHost(Usuario host) { this.host = host; }

    public List<SalaParticipante> getParticipantes() { return participantes; }
    public void setParticipantes(List<SalaParticipante> participantes) { this.participantes = participantes; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public enum Estado { ESPERANDO, JUGANDO, TERMINADA }
}
