package com.quizsloth.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "calificaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    @PrePersist
    protected void onCreate() {
        this.fechaCompletado = LocalDateTime.now();
    }
}
