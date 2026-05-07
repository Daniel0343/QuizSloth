package com.quizsloth.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "calificaciones")
public class Calificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_quiz")
    private Quiz quiz;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal puntuacion;

    @Column(name = "fecha_completado", updatable = false)
    private LocalDateTime fechaCompletado;

    public Calificacion() {}

    public Calificacion(Integer id, Usuario usuario, Quiz quiz, BigDecimal puntuacion, LocalDateTime fechaCompletado) {
        this.id = id;
        this.usuario = usuario;
        this.quiz = quiz;
        this.puntuacion = puntuacion;
        this.fechaCompletado = fechaCompletado;
    }

    @PrePersist
    protected void onCreate() {
        this.fechaCompletado = LocalDateTime.now();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }

    public BigDecimal getPuntuacion() { return puntuacion; }
    public void setPuntuacion(BigDecimal puntuacion) { this.puntuacion = puntuacion; }

    public LocalDateTime getFechaCompletado() { return fechaCompletado; }
    public void setFechaCompletado(LocalDateTime fechaCompletado) { this.fechaCompletado = fechaCompletado; }
}
