package com.quizsloth.dto;

import com.quizsloth.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AuthResponse {

    private UserDTO user;
    private String token;

    @Data
    @AllArgsConstructor
    public static class UserDTO {
        private Integer id;
        private String nombre;
        private String email;
        private String rol;
        private Integer odooId;
        private LocalDateTime fechaRegistro;
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
