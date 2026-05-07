package com.quizsloth.dto;

import com.quizsloth.model.Usuario;

import java.time.LocalDateTime;

public class AuthResponse {

    private UserDTO user;
    private String token;

    public AuthResponse() {}

    public AuthResponse(UserDTO user, String token) {
        this.user = user;
        this.token = token;
    }

    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public static class UserDTO {
        private Integer id;
        private String nombre;
        private String email;
        private String rol;
        private Integer odooId;
        private LocalDateTime fechaRegistro;

        public UserDTO() {}

        public UserDTO(Integer id, String nombre, String email, String rol,
                       Integer odooId, LocalDateTime fechaRegistro) {
            this.id = id;
            this.nombre = nombre;
            this.email = email;
            this.rol = rol;
            this.odooId = odooId;
            this.fechaRegistro = fechaRegistro;
        }

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }

        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getRol() { return rol; }
        public void setRol(String rol) { this.rol = rol; }

        public Integer getOdooId() { return odooId; }
        public void setOdooId(Integer odooId) { this.odooId = odooId; }

        public LocalDateTime getFechaRegistro() { return fechaRegistro; }
        public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
    }

    public static AuthResponse from(Usuario usuario, String token) {
        UserDTO userDTO = new UserDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name(),
                usuario.getOdooId(),
                usuario.getFechaRegistro()
        );
        return new AuthResponse(userDTO, token);
    }
}
