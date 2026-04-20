package com.quizsloth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "colecciones")
@Data
@NoArgsConstructor
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
}
