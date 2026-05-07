package com.quizsloth.dto;

public class SubscripcionDTO {
    private String estado;       // "activa" | "expirada" | "sin_subscripcion"
    private String plan;
    private String fechaInicio;
    private String fechaFin;
    private Integer odooId;

    public SubscripcionDTO() {}

    public SubscripcionDTO(String estado, String plan, String fechaInicio, String fechaFin, Integer odooId) {
        this.estado = estado;
        this.plan = plan;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.odooId = odooId;
    }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }

    public String getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(String fechaInicio) { this.fechaInicio = fechaInicio; }

    public String getFechaFin() { return fechaFin; }
    public void setFechaFin(String fechaFin) { this.fechaFin = fechaFin; }

    public Integer getOdooId() { return odooId; }
    public void setOdooId(Integer odooId) { this.odooId = odooId; }
}
