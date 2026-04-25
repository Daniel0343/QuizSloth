package com.quizsloth.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "salas")
@Data
@NoArgsConstructor
public class Sala {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 8)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Estado estado = Estado.ESPERANDO;

    @Column(name = "pregunta_actual_idx")
    private int preguntaActualIdx = -1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_quiz", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_host", nullable = false)
    private Usuario host;

    @OneToMany(mappedBy = "sala", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<SalaParticipante> participantes = new ArrayList<>();

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    void onCreate() { fechaCreacion = LocalDateTime.now(); }

    public enum Estado { ESPERANDO, JUGANDO, TERMINADA }
}
