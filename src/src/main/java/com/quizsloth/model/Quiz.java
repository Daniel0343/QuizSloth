package com.quizsloth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "quizzes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_documento")
    private Documento documento;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_creador")
    private Usuario creador;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_categoria")
    private Categoria categoria;

    @Enumerated(EnumType.STRING)
    private Dificultad dificultad = Dificultad.normal;

    @Column(length = 20)
    private String color = "#E8B84B";

    @Column(name = "es_plantilla", nullable = false)
    private boolean esPlantilla = false;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @JsonIgnore
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Pregunta> preguntas;

    public Quiz() {}

    public Quiz(Integer id, String titulo, Documento documento, Usuario creador, Categoria categoria,
                Dificultad dificultad, String color, boolean esPlantilla, LocalDateTime fechaCreacion,
                List<Pregunta> preguntas) {
        this.id = id;
        this.titulo = titulo;
        this.documento = documento;
        this.creador = creador;
        this.categoria = categoria;
        this.dificultad = dificultad;
        this.color = color;
        this.esPlantilla = esPlantilla;
        this.fechaCreacion = fechaCreacion;
        this.preguntas = preguntas;
    }

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public Documento getDocumento() { return documento; }
    public void setDocumento(Documento documento) { this.documento = documento; }

    public Usuario getCreador() { return creador; }
    public void setCreador(Usuario creador) { this.creador = creador; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }

    public Dificultad getDificultad() { return dificultad; }
    public void setDificultad(Dificultad dificultad) { this.dificultad = dificultad; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public boolean isEsPlantilla() { return esPlantilla; }
    public void setEsPlantilla(boolean esPlantilla) { this.esPlantilla = esPlantilla; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public List<Pregunta> getPreguntas() { return preguntas; }
    public void setPreguntas(List<Pregunta> preguntas) { this.preguntas = preguntas; }

    public enum Dificultad {
        facil, normal, dificil, extremo
    }
}
