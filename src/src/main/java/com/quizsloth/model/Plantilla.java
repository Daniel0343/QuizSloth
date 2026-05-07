package com.quizsloth.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plantillas")
public class Plantilla {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;

    @Enumerated(EnumType.STRING)
    private Quiz.Dificultad dificultad = Quiz.Dificultad.normal;

    @OneToMany(mappedBy = "plantilla", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PreguntaPlantilla> preguntas = new ArrayList<>();

    public Plantilla() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }

    public Quiz.Dificultad getDificultad() { return dificultad; }
    public void setDificultad(Quiz.Dificultad dificultad) { this.dificultad = dificultad; }

    public List<PreguntaPlantilla> getPreguntas() { return preguntas; }
    public void setPreguntas(List<PreguntaPlantilla> preguntas) { this.preguntas = preguntas; }
}
