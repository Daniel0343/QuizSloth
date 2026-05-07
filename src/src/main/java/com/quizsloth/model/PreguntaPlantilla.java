package com.quizsloth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "preguntas_plantilla")
public class PreguntaPlantilla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_plantilla")
    private Plantilla plantilla;

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

    public PreguntaPlantilla() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Plantilla getPlantilla() { return plantilla; }
    public void setPlantilla(Plantilla plantilla) { this.plantilla = plantilla; }

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
}
