package com.quizsloth.controller;

import com.quizsloth.model.Pregunta;
import com.quizsloth.model.Quiz;
import com.quizsloth.security.JwtUtil;
import com.quizsloth.service.IAService;
import com.quizsloth.service.QuizService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/quizzes")
public class QuizController {

    private final QuizService quizService;
    private final IAService iaService;
    private final JwtUtil jwtUtil;

    public QuizController(QuizService quizService, IAService iaService, JwtUtil jwtUtil) {
        this.quizService = quizService;
        this.iaService = iaService;
        this.jwtUtil = jwtUtil;
    }

    // Extrae el email del token JWT del encabezado Authorization
    private String emailFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try { return jwtUtil.extractEmail(header.substring(7)); } catch (Exception ignored) {}
        }
        return null;
    }

    // GET /quizzes - Lista quizzes públicos, filtrable por categoría
    @GetMapping
    public ResponseEntity<List<Quiz>> listar(
            @RequestParam(required = false) Integer categoriaId) {
        if (categoriaId != null) return ResponseEntity.ok(quizService.listarPorCategoria(categoriaId));
        return ResponseEntity.ok(quizService.listarTodos());
    }

    // POST /quizzes - Crea un quiz vacío en borrador
    @PostMapping
    public ResponseEntity<Quiz> crear(@RequestBody CrearQuizRequest req, HttpServletRequest request) {
        Quiz quiz = quizService.crearVacio(req.getTitulo(), req.getCategoriaId(), emailFromRequest(request));
        return ResponseEntity.ok(quiz);
    }

    static class CrearQuizRequest {
        private String titulo;
        private Integer categoriaId;

        public String getTitulo() { return titulo; }
        public void setTitulo(String titulo) { this.titulo = titulo; }
        public Integer getCategoriaId() { return categoriaId; }
        public void setCategoriaId(Integer categoriaId) { this.categoriaId = categoriaId; }
    }

    // GET /quizzes/mis-quizzes - Lista todos los quizzes del usuario autenticado incluyendo borradores
    @GetMapping("/mis-quizzes")
    public ResponseEntity<List<QuizService.QuizResumenDTO>> misQuizzes(HttpServletRequest request) {
        return ResponseEntity.ok(quizService.listarPorCreadorDTO(emailFromRequest(request)));
    }

    // GET /quizzes/plantillas - Lista los quizzes marcados como plantilla
    @GetMapping("/plantillas")
    public ResponseEntity<List<Quiz>> plantillas() {
        return ResponseEntity.ok(quizService.listarPlantillas());
    }

    // POST /quizzes/{id}/clonar - Clona una plantilla de quiz
    @PostMapping("/{id}/clonar")
    public ResponseEntity<QuizService.QuizConPreguntas> clonar(
            @PathVariable Integer id, HttpServletRequest request) {
        return ResponseEntity.ok(quizService.clonarPlantilla(id, emailFromRequest(request)));
    }

    // DELETE /quizzes/{id} - Elimina un quiz del usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id, HttpServletRequest request) {
        quizService.eliminar(id, emailFromRequest(request));
        return ResponseEntity.noContent().build();
    }

    // GET /quizzes/{id} - Devuelve el detalle de un quiz
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(quizService.obtener(id));
    }

    // GET /quizzes/{id}/preguntas - Devuelve las preguntas del quiz ordenadas
    @GetMapping("/{id}/preguntas")
    public ResponseEntity<List<Pregunta>> preguntas(@PathVariable Integer id) {
        return ResponseEntity.ok(quizService.obtenerPreguntas(id));
    }

    // POST /quizzes/generar - Genera preguntas IA desde un documento subido
    @PostMapping("/generar")
    public ResponseEntity<Quiz> generarConIA(@RequestBody GenerarQuizRequest req, HttpServletRequest request) {
        Quiz quiz = quizService.generarDesdeDocumento(
                req.getDocumentoId(), req.getTitulo(), req.getNumPreguntas(),
                emailFromRequest(request));
        return ResponseEntity.ok(quiz);
    }

    // POST /quizzes/generar-desde-texto - Genera preguntas IA desde texto libre
    @PostMapping("/generar-desde-texto")
    public ResponseEntity<QuizService.QuizConPreguntas> generarDesdeTexto(
            @RequestBody GenerarDesdeTextoRequest req, HttpServletRequest request) {
        QuizService.QuizConPreguntas resultado = quizService.generarDesdeTexto(
                req.getTitulo(), req.getTexto(), req.getNumPreguntas(), req.getDificultad(),
                req.getCategoriaId(), emailFromRequest(request));
        return ResponseEntity.ok(resultado);
    }

    // POST /quizzes/generar-desde-archivo - Extrae texto de un PDF y genera preguntas con IA
    @PostMapping("/generar-desde-archivo")
    public ResponseEntity<QuizService.QuizConPreguntas> generarDesdeArchivo(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("titulo") String titulo,
            @RequestParam("numPreguntas") int numPreguntas,
            @RequestParam(value = "dificultad", defaultValue = "normal") String dificultad,
            @RequestParam(value = "categoriaId", required = false) Integer categoriaId,
            HttpServletRequest request) throws Exception {

        byte[] bytes = archivo.getBytes();
        String texto = iaService.extraerTextoPDF(bytes);

        QuizService.QuizConPreguntas resultado = quizService.generarDesdeTexto(
                titulo, texto, numPreguntas, dificultad, categoriaId, emailFromRequest(request));
        return ResponseEntity.ok(resultado);
    }

    // POST /quizzes/{id}/publicar - Publica el quiz haciéndolo visible en las categorías
    @PostMapping("/{id}/publicar")
    public ResponseEntity<Quiz> publicar(@PathVariable Integer id) {
        return ResponseEntity.ok(quizService.publicar(id));
    }

    // POST /quizzes/{id}/despublicar - Vuelve el quiz a estado borrador
    @PostMapping("/{id}/despublicar")
    public ResponseEntity<Quiz> despublicar(@PathVariable Integer id) {
        return ResponseEntity.ok(quizService.despublicar(id));
    }

    // PUT /quizzes/{id} - Actualiza los campos generales del quiz
    @PutMapping("/{id}")
    public ResponseEntity<Quiz> actualizarQuiz(
            @PathVariable Integer id,
            @RequestBody ActualizarQuizRequest req) {
        Quiz quiz = quizService.actualizarQuiz(
                id, req.getTitulo(), req.getDificultad(), req.getCategoriaId(), req.getColor());
        return ResponseEntity.ok(quiz);
    }

    static class GenerarQuizRequest {
        private Integer documentoId;
        private String titulo;
        private int numPreguntas = 5;

        public Integer getDocumentoId() { return documentoId; }
        public void setDocumentoId(Integer documentoId) { this.documentoId = documentoId; }
        public String getTitulo() { return titulo; }
        public void setTitulo(String titulo) { this.titulo = titulo; }
        public int getNumPreguntas() { return numPreguntas; }
        public void setNumPreguntas(int numPreguntas) { this.numPreguntas = numPreguntas; }
    }

    static class GenerarDesdeTextoRequest {
        private String titulo;
        private String texto;
        private int numPreguntas = 5;
        private String dificultad = "normal";
        private Integer categoriaId;

        public String getTitulo() { return titulo; }
        public void setTitulo(String titulo) { this.titulo = titulo; }
        public String getTexto() { return texto; }
        public void setTexto(String texto) { this.texto = texto; }
        public int getNumPreguntas() { return numPreguntas; }
        public void setNumPreguntas(int numPreguntas) { this.numPreguntas = numPreguntas; }
        public String getDificultad() { return dificultad; }
        public void setDificultad(String dificultad) { this.dificultad = dificultad; }
        public Integer getCategoriaId() { return categoriaId; }
        public void setCategoriaId(Integer categoriaId) { this.categoriaId = categoriaId; }
    }

    static class ActualizarQuizRequest {
        private String titulo;
        private String dificultad;
        private Integer categoriaId;
        private String color;

        public String getTitulo() { return titulo; }
        public void setTitulo(String titulo) { this.titulo = titulo; }
        public String getDificultad() { return dificultad; }
        public void setDificultad(String dificultad) { this.dificultad = dificultad; }
        public Integer getCategoriaId() { return categoriaId; }
        public void setCategoriaId(Integer categoriaId) { this.categoriaId = categoriaId; }
        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }
    }
}
