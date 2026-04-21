package com.quizsloth.service;

import com.quizsloth.model.*;
import com.quizsloth.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlantillaService {

    private final PlantillaRepository plantillaRepository;
    private final QuizRepository quizRepository;
    private final PreguntaRepository preguntaRepository;
    private final UsuarioRepository usuarioRepository;

    public List<Plantilla> listar() {
        return plantillaRepository.findAll();
    }

    @Transactional
    public QuizService.QuizConPreguntas clonar(Integer plantillaId, String emailCreador) {
        Plantilla plantilla = plantillaRepository.findById(plantillaId)
                .orElseThrow(() -> new RuntimeException("Plantilla no encontrada"));

        Quiz quiz = new Quiz();
        quiz.setTitulo(plantilla.getTitulo());
        quiz.setDificultad(plantilla.getDificultad());
        quiz.setCategoria(plantilla.getCategoria());
        quiz.setEsPlantilla(false);
        if (emailCreador != null) {
            usuarioRepository.findByEmail(emailCreador).ifPresent(quiz::setCreador);
        }
        Quiz savedQuiz = quizRepository.save(quiz);

        List<PreguntaPlantilla> origen = plantilla.getPreguntas();
        for (int i = 0; i < origen.size(); i++) {
            PreguntaPlantilla orig = origen.get(i);
            Pregunta copia = new Pregunta();
            copia.setQuiz(savedQuiz);
            copia.setEnunciado(orig.getEnunciado());
            copia.setOpcionA(orig.getOpcionA());
            copia.setOpcionB(orig.getOpcionB());
            copia.setOpcionC(orig.getOpcionC());
            copia.setOpcionD(orig.getOpcionD());
            copia.setRespuestaCorrecta(orig.getRespuestaCorrecta());
            copia.setDificultad(orig.getDificultad());
            copia.setOrden(i);
            preguntaRepository.save(copia);
        }

        List<Pregunta> preguntas = preguntaRepository.findByQuizOrderByOrden(savedQuiz);
        return new QuizService.QuizConPreguntas(savedQuiz, preguntas);
    }
}
