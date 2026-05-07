package com.quizsloth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "apuntes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Apunte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 300)
    private String titulo;

    @Column(name = "contenido_json", columnDefinition = "LONGTEXT")
    private String contenidoJson;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    public Apunte() {}

    public Apunte(Integer id, String titulo, String contenidoJson, Usuario usuario, LocalDateTime fechaCreacion) {
        this.id = id;
        this.titulo = titulo;
        this.contenidoJson = contenidoJson;
        this.usuario = usuario;
        this.fechaCreacion = fechaCreacion;
    }

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getContenidoJson() { return contenidoJson; }
    public void setContenidoJson(String contenidoJson) { this.contenidoJson = contenidoJson; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
