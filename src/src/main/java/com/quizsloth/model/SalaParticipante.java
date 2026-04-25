package com.quizsloth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sala_participantes")
@Data
@NoArgsConstructor
public class SalaParticipante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sala", nullable = false)
    private Sala sala;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario; // null para invitados

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(nullable = false)
    private int puntos = 0;

    @Column(name = "respondio_actual", nullable = false)
    private boolean respondioActual = false;

    @Column(name = "respuesta_actual", length = 1)
    private String respuestaActual;
}
