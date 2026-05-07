package com.quizsloth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "colecciones")
public class Coleccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToMany
    @JoinTable(
        name = "coleccion_quizzes",
        joinColumns = @JoinColumn(name = "coleccion_id"),
        inverseJoinColumns = @JoinColumn(name = "quiz_id")
    )
    private List<Quiz> quizzes = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "coleccion_apuntes",
        joinColumns = @JoinColumn(name = "coleccion_id"),
        inverseJoinColumns = @JoinColumn(name = "apunte_id")
    )
    private List<Apunte> apuntes = new ArrayList<>();

    public Coleccion() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public List<Quiz> getQuizzes() { return quizzes; }
    public void setQuizzes(List<Quiz> quizzes) { this.quizzes = quizzes; }

    public List<Apunte> getApuntes() { return apuntes; }
    public void setApuntes(List<Apunte> apuntes) { this.apuntes = apuntes; }
}
