package com.quizsloth.dto;

import com.quizsloth.model.Usuario;

public class RegisterRequest {

    private String nombre;
    private String email;
    private String password;
    private Usuario.Rol rol;

    public RegisterRequest() {}

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Usuario.Rol getRol() { return rol; }
    public void setRol(Usuario.Rol rol) { this.rol = rol; }
}
