package com.quizsloth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SubscripcionDTO {
    private String estado;       // "activa" | "expirada" | "sin_subscripcion"
    private String plan;
    private String fechaInicio;
    private String fechaFin;
    private Integer odooId;
}
