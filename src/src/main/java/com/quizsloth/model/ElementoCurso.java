package com.quizsloth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "elementos_curso")
public class ElementoCurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Tipo tipo;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String contenido;

    @Column
    private Integer orden = 0;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_seccion", nullable = false)
    private SeccionCurso seccion;

    public ElementoCurso() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Tipo getTipo() { return tipo; }
    public void setTipo(Tipo tipo) { this.tipo = tipo; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public Integer getOrden() { return orden; }
    public void setOrden(Integer orden) { this.orden = orden; }

    public SeccionCurso getSeccion() { return seccion; }
    public void setSeccion(SeccionCurso seccion) { this.seccion = seccion; }

    public enum Tipo { TEXTO, ENLACE, PDF, QUIZ, APUNTE }
}
