package com.quizsloth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "preguntas")
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

    public Pregunta() {}

    public Pregunta(Integer id, Quiz quiz, String enunciado, String opcionA, String opcionB,
                    String opcionC, String opcionD, String respuestaCorrecta,
                    Quiz.Dificultad dificultad, Integer orden, BigDecimal peso, Integer segundos) {
        this.id = id;
        this.quiz = quiz;
        this.enunciado = enunciado;
        this.opcionA = opcionA;
        this.opcionB = opcionB;
        this.opcionC = opcionC;
        this.opcionD = opcionD;
        this.respuestaCorrecta = respuestaCorrecta;
        this.dificultad = dificultad;
        this.orden = orden;
        this.peso = peso;
        this.segundos = segundos;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }

    public String getEnunciado() { return enunciado; }
    public void setEnunciado(String enunciado) { this.enunciado = enunciado; }

    public String getOpcionA() { return opcionA; }
    public void setOpcionA(String opcionA) { this.opcionA = opcionA; }

    public String getOpcionB() { return opcionB; }
    public void setOpcionB(String opcionB) { this.opcionB = opcionB; }

    public String getOpcionC() { return opcionC; }
    public void setOpcionC(String opcionC) { this.opcionC = opcionC; }

    public String getOpcionD() { return opcionD; }
    public void setOpcionD(String opcionD) { this.opcionD = opcionD; }

    public String getRespuestaCorrecta() { return respuestaCorrecta; }
    public void setRespuestaCorrecta(String respuestaCorrecta) { this.respuestaCorrecta = respuestaCorrecta; }

    public Quiz.Dificultad getDificultad() { return dificultad; }
    public void setDificultad(Quiz.Dificultad dificultad) { this.dificultad = dificultad; }

    public Integer getOrden() { return orden; }
    public void setOrden(Integer orden) { this.orden = orden; }

    public BigDecimal getPeso() { return peso; }
    public void setPeso(BigDecimal peso) { this.peso = peso; }

    public Integer getSegundos() { return segundos; }
    public void setSegundos(Integer segundos) { this.segundos = segundos; }
}
