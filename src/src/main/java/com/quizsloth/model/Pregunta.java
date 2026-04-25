package com.quizsloth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "preguntas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Pregunta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_quiz")
    private Quiz quiz;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String enunciado;

    @Column(name = "opcion_a", nullable = false, length = 255)
    private String opcionA;

    @Column(name = "opcion_b", nullable = false, length = 255)
    private String opcionB;

    @Column(name = "opcion_c", nullable = false, length = 255)
    private String opcionC;

    @Column(name = "opcion_d", nullable = false, length = 255)
    private String opcionD;

    @Column(name = "respuesta_correcta", nullable = false, columnDefinition = "CHAR(1)")
    private String respuestaCorrecta;

    @Enumerated(EnumType.STRING)
    private Quiz.Dificultad dificultad = Quiz.Dificultad.normal;

    @Column(name = "orden")
    private Integer orden = 0;

    @Column(name = "peso", precision = 5, scale = 2)
    private BigDecimal peso = BigDecimal.ONE;

    @Column(name = "segundos")
    private Integer segundos = 30;
}
