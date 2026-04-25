package com.quizsloth.servidor;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Mensaje {

    // Tipos de mensaje cliente  servidor
    public static final String CREAR_SALA       = "crear_sala";
    public static final String UNIRSE_SALA      = "unirse_sala";
    public static final String INICIAR_PARTIDA  = "iniciar_partida";
    public static final String RESPONDER        = "responder";
    public static final String SIGUIENTE        = "siguiente_pregunta";
    public static final String FINALIZAR        = "finalizar_partida";

    // Tipos de mensaje servidor  cliente
    public static final String SALA_CREADA          = "sala_creada";
    public static final String SALA_UNIDA           = "sala_unida";
    public static final String JUGADORES            = "jugadores_actualizados";
    public static final String PARTIDA_INICIADA     = "partida_iniciada";
    public static final String NUEVA_PREGUNTA       = "nueva_pregunta";
    public static final String PARTIDA_FINALIZADA   = "partida_finalizada";
    public static final String NUEVO_HOST           = "nuevo_host";
    public static final String ERROR                = "error";

    private String tipo;
    private String codigo;
    private String nombre;
    private Integer quizId;
    private Integer respuestaId;
    private Boolean correcta;
    private Integer tiempo;
    private String mensaje;

    private static final ObjectMapper mapper = new ObjectMapper();

    public static Mensaje parse(String json) {
        try {
            return mapper.readValue(json, Mensaje.class);
        } catch (Exception e) {
            return null;
        }
    }

    public String toJson() {
        try {
            return mapper.writeValueAsString(this);
        } catch (Exception e) {
            return "{\"tipo\":\"error\",\"mensaje\":\"Error serializando mensaje\"}";
        }
    }

    public static Mensaje of(String tipo) {
        Mensaje m = new Mensaje();
        m.setTipo(tipo);
        return m;
    }

    public static Mensaje error(String msg) {
        Mensaje m = new Mensaje();
        m.setTipo(ERROR);
        m.setMensaje(msg);
        return m;
    }
}
