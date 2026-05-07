package com.quizsloth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cursos")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 20)
    private String color = "#24833D";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_profesor")
    @JsonIgnoreProperties({"password", "cursos", "documentos", "hibernateLazyInitializer"})
    private Usuario profesor;

    @JsonIgnore
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "curso_alumnos",
        joinColumns = @JoinColumn(name = "id_curso"),
        inverseJoinColumns = @JoinColumn(name = "id_alumno")
    )
    private List<Usuario> alumnos = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Documento> documentos;

    public Curso() {}

    public Curso(Integer id, String nombre, String descripcion, String color,
                 Usuario profesor, List<Usuario> alumnos, List<Documento> documentos) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.color = color;
        this.profesor = profesor;
        this.alumnos = alumnos;
        this.documentos = documentos;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Usuario getProfesor() { return profesor; }
    public void setProfesor(Usuario profesor) { this.profesor = profesor; }

    public List<Usuario> getAlumnos() { return alumnos; }
    public void setAlumnos(List<Usuario> alumnos) { this.alumnos = alumnos; }

    public List<Documento> getDocumentos() { return documentos; }
    public void setDocumentos(List<Documento> documentos) { this.documentos = documentos; }
}
