package com.quizsloth.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categorias")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(name = "creado_por_email", length = 200)
    private String creadoPorEmail;

    public Categoria() {}

    public Categoria(Integer id, String nombre, String creadoPorEmail) {
        this.id = id;
        this.nombre = nombre;
        this.creadoPorEmail = creadoPorEmail;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCreadoPorEmail() { return creadoPorEmail; }
    public void setCreadoPorEmail(String creadoPorEmail) { this.creadoPorEmail = creadoPorEmail; }
}
