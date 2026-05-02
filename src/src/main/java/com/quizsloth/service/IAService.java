package com.quizsloth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizsloth.model.Documento;
import com.quizsloth.model.Pregunta;
import com.quizsloth.model.Quiz;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class IAService {

    @Value("${ia.openai.api-url}")
    private String apiUrl;

    @Value("${ia.openai.api-key}")
    private String apiKey;

    @Value("${ia.openai.model}")
    private String model;

    @Value("${app.upload.dir}")
    private String uploadDir;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Pregunta> generarPreguntas(Documento documento, int numPreguntas) {
        try {
            String texto = leerTextoDocumento(documento.getRutaAlmacenamiento());
            return generarPreguntasDesdeTexto(texto, numPreguntas, "normal");
        } catch (Exception e) {
            log.error("Error generando preguntas para documento {}: {}", documento.getId(), e.getMessage());
            throw new RuntimeException("Error al generar preguntas con IA: " + e.getMessage(), e);
        }
    }

    public List<Pregunta> generarPreguntasDesdeTexto(String texto, int numPreguntas, String dificultad) {
        try {
            String textoLimitado = texto.length() > 9000 ? texto.substring(0, 9000) : texto;
            String nivel = (dificultad != null && !dificultad.isBlank()) ? dificultad : "normal";
            String prompt = construirPrompt(textoLimitado, numPreguntas, nivel);
            String respuestaJson = llamarOpenAI(prompt);
            return parsearPreguntas(respuestaJson);
        } catch (Exception e) {
            log.error("Error generando preguntas desde texto: {}", e.getMessage());
            throw new RuntimeException("Error al generar preguntas con IA: " + e.getMessage(), e);
        }
    }

    public String extraerTextoPDF(byte[] bytes) throws Exception {
        try (PDDocument doc = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc);
        }
    }

    public String extraerTextoPPTX(byte[] bytes) throws Exception {
        try (XMLSlideShow ppt = new XMLSlideShow(new ByteArrayInputStream(bytes))) {
            StringBuilder sb = new StringBuilder();
            for (XSLFSlide slide : ppt.getSlides()) {
                for (XSLFShape shape : slide.getShapes()) {
                    if (shape instanceof XSLFTextShape textShape) {
                        sb.append(textShape.getText()).append("\n");
                    }
                }
            }
            return sb.toString();
        }
    }

    private String leerTextoDocumento(String ruta) throws Exception {
        Path path = Path.of(uploadDir + ruta);
        if (!Files.exists(path)) {
            throw new RuntimeException("Archivo no encontrado: " + ruta);
        }
        byte[] bytes = Files.readAllBytes(path);
        String contenido = new String(bytes, StandardCharsets.UTF_8);
        return contenido.length() > 12000 ? contenido.substring(0, 12000) : contenido;
    }

    private String construirPrompt(String texto, int numPreguntas, String dificultad) {
        String descripcionDificultad = switch (dificultad) {
            case "facil"   -> "FACIL: preguntas directas sobre datos concretos del texto, opciones incorrectas claramente distintas.";
            case "dificil" -> "DIFICIL: preguntas que requieren comprension profunda, comparacion entre conceptos o deduccion. Las opciones incorrectas deben ser plausibles y parecidas a la correcta.";
            case "extremo" -> "EXTREMO: preguntas muy especificas sobre detalles, excepciones o implicaciones del texto. Todas las opciones deben parecer posibles a primera vista. Solo una es correcta.";
            default        -> "NORMAL: preguntas de comprension general del texto. Opciones incorrectas razonables pero distinguibles.";
        };

        return String.format("""
            Eres un generador de cuestionarios educativos. A partir del siguiente texto,
            genera exactamente %d preguntas de tipo test con 4 opciones (A, B, C, D) y
            una sola respuesta correcta.

            NIVEL DE DIFICULTAD: %s
            %s

            IMPORTANTE: distribuye las respuestas correctas aleatoriamente entre A, B, C y D.
            No pongas todas las respuestas correctas en la misma opcion.
            Varia la posicion correcta de forma que no haya un patron predecible.

            Responde UNICAMENTE con un array JSON con esta estructura exacta, sin texto adicional:
            [
              {
                "enunciado": "Texto de la pregunta",
                "opcion_a": "Primera opcion",
                "opcion_b": "Segunda opcion",
                "opcion_c": "Tercera opcion",
                "opcion_d": "Cuarta opcion",
                "respuesta_correcta": "B",
                "dificultad": "%s"
              }
            ]

            Los valores de "respuesta_correcta" deben ser: A, B, C o D, variando entre preguntas.

            TEXTO:
            %s
            """, numPreguntas, dificultad.toUpperCase(), descripcionDificultad, dificultad, texto);
    }

    private String llamarOpenAI(String prompt) throws Exception {
        String requestBody = objectMapper.writeValueAsString(new java.util.LinkedHashMap<>() {{
            put("model", model);
            put("messages", List.of(
                    new java.util.LinkedHashMap<>() {{
                        put("role", "user");
                        put("content", prompt);
                    }}
            ));
            put("temperature", 0.7);
            put("max_tokens", 4096);
        }});

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                .timeout(Duration.ofSeconds(90))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("OpenAI respondió con HTTP " + response.statusCode() + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        return root.path("choices").get(0).path("message").path("content").asText();
    }

    public String generarApuntesDesdeTexto(String texto) {
        try {
            String textoLimitado = texto.length() > 9000 ? texto.substring(0, 9000) : texto;
            String prompt = construirPromptApuntes(textoLimitado);
            String respuesta = llamarOpenAI(prompt);
            return limpiarJson(respuesta);
        } catch (Exception e) {
            log.error("Error generando apuntes: {}", e.getMessage());
            throw new RuntimeException("Error al generar apuntes con IA: " + e.getMessage(), e);
        }
    }

    private String construirPromptApuntes(String texto) {
        return String.format("""
            Eres un asistente educativo experto. A partir del siguiente tema o texto,
            genera apuntes estructurados y completos. Decide tú mismo cuántas secciones
            son necesarias según la complejidad y amplitud del tema (mínimo 2, máximo 6).

            Responde ÚNICAMENTE con un objeto JSON con esta estructura exacta, sin texto adicional:
            {
              "titulo": "Título descriptivo del tema",
              "resumen": "Párrafo introductorio de 3-4 frases explicando el tema",
              "secciones": [
                {
                  "titulo": "Título de la sección",
                  "contenido": "Explicación detallada de 3-5 frases",
                  "puntosClave": ["Punto importante 1", "Punto importante 2", "Punto importante 3"]
                }
              ],
              "referencias": [
                {
                  "titulo": "Nombre del recurso",
                  "url": "https://url-real-y-accesible.com/pagina",
                  "descripcion": "Breve descripción de qué encontrar en este enlace"
                }
              ]
            }

            IMPORTANTE para las referencias:
            - Usa URLs REALES y accesibles (Wikipedia en español, Khan Academy, sitios educativos oficiales)
            - Incluye entre 3 y 5 referencias relevantes
            - Prefiere Wikipedia en español: https://es.wikipedia.org/wiki/...

            TEMA O TEXTO:
            %s
            """, texto);
    }

    private String limpiarJson(String respuesta) {
        return respuesta.trim()
                .replaceAll("(?s)```json\\s*", "")
                .replaceAll("(?s)```\\s*", "")
                .trim();
    }

    private List<Pregunta> parsearPreguntas(String jsonRespuesta) throws Exception {
        String json = jsonRespuesta.trim()
                .replaceAll("```json", "")
                .replaceAll("```", "")
                .trim();

        JsonNode array = objectMapper.readTree(json);
        List<Pregunta> preguntas = new ArrayList<>();

        for (JsonNode node : array) {
            Pregunta pregunta = new Pregunta();
            pregunta.setEnunciado(node.path("enunciado").asText());
            pregunta.setOpcionA(node.path("opcion_a").asText());
            pregunta.setOpcionB(node.path("opcion_b").asText());
            pregunta.setOpcionC(node.path("opcion_c").asText());
            pregunta.setOpcionD(node.path("opcion_d").asText());
            pregunta.setRespuestaCorrecta(node.path("respuesta_correcta").asText().toUpperCase());

            String dificultadStr = node.path("dificultad").asText("normal");
            try {
                pregunta.setDificultad(Quiz.Dificultad.valueOf(dificultadStr));
            } catch (IllegalArgumentException e) {
                pregunta.setDificultad(Quiz.Dificultad.normal);
            }

            preguntas.add(pregunta);
        }

        log.info("IA generó {} preguntas", preguntas.size());
        return preguntas;
    }
}
