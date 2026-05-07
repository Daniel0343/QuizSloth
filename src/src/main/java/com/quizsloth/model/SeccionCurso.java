package com.quizsloth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "secciones_curso")
public class SeccionCurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String titulo;

    @Column
    private Integer orden = 0;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_curso", nullable = false)
    private Curso curso;

    @OneToMany(mappedBy = "seccion", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @OrderBy("orden ASC")
    private List<ElementoCurso> elementos = new ArrayList<>();

    public SeccionCurso() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public Integer getOrden() { return orden; }
    public void setOrden(Integer orden) { this.orden = orden; }

    public Curso getCurso() { return curso; }
    public void setCurso(Curso curso) { this.curso = curso; }

    public List<ElementoCurso> getElementos() { return elementos; }
    public void setElementos(List<ElementoCurso> elementos) { this.elementos = elementos; }
}
