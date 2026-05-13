package com.quizsloth.service;

import com.quizsloth.model.*;
import com.quizsloth.repositoryDAO.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quizsloth.repositoryDAO.CalificacionRepository;
import com.quizsloth.repositoryDAO.QuizRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class CursoService {

    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SeccionCursoRepository seccionRepository;
    private final ElementoCursoRepository elementoRepository;
    private final CalificacionRepository calificacionRepository;
    private final QuizRepository quizRepository;

    public CursoService(CursoRepository cursoRepository,
                        UsuarioRepository usuarioRepository,
                        SeccionCursoRepository seccionRepository,
                        ElementoCursoRepository elementoRepository,
                        CalificacionRepository calificacionRepository,
                        QuizRepository quizRepository) {
        this.cursoRepository = cursoRepository;
        this.usuarioRepository = usuarioRepository;
        this.seccionRepository = seccionRepository;
        this.elementoRepository = elementoRepository;
        this.calificacionRepository = calificacionRepository;
        this.quizRepository = quizRepository;
    }

    public record CursoDTO(Integer id, String nombre, String descripcion, String color,
                           int numAlumnos, ProfesorInfo profesor) {}
    public record ProfesorInfo(Integer id, String nombre, String email) {}
    public record SeccionDTO(Integer id, String titulo, Integer orden, List<ElementoDTO> elementos) {}
    public record ElementoDTO(Integer id, String tipo, String titulo, String contenido, Integer orden) {}
    public record ParticipanteDTO(Integer id, String nombre, String email, String rol) {}
    public record CalificacionAlumnoDTO(String alumnoNombre, String alumnoEmail, double puntuacion, int porcentaje, String fecha) {}
    public record CalificacionQuizDTO(Integer quizId, String quizTitulo, String seccionTitulo, List<CalificacionAlumnoDTO> calificaciones) {}

    // Convierte la entidad Curso en su DTO para la respuesta REST
    private CursoDTO toDTO(Curso c) {
        int num = c.getAlumnos() != null ? c.getAlumnos().size() : 0;
        ProfesorInfo prof = c.getProfesor() != null
                ? new ProfesorInfo(c.getProfesor().getId(), c.getProfesor().getNombre(), c.getProfesor().getEmail()) : null;
        return new CursoDTO(c.getId(), c.getNombre(), c.getDescripcion(), c.getColor(), num, prof);
    }

    // Convierte una SeccionCurso en su DTO incluyendo sus elementos
    private SeccionDTO toSeccionDTO(SeccionCurso s) {
        List<ElementoDTO> elems = s.getElementos().stream()
                .map(e -> new ElementoDTO(e.getId(), e.getTipo().name(), e.getTitulo(), e.getContenido(), e.getOrden()))
                .toList();
        return new SeccionDTO(s.getId(), s.getTitulo(), s.getOrden(), elems);
    }

    // Recupera un usuario por email o lanza excepción si no existe
    private Usuario getUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // Recupera un curso por ID o lanza excepción si no existe
    private Curso getCurso(Integer id) {
        return cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));
    }

    // Verifica que el usuario tiene rol de profesor en el curso, lanza excepción si no
    private void verificarProfesor(Curso curso, String email) {
        if (curso.getProfesor() != null && curso.getProfesor().getEmail().equals(email)) return;
        List<Usuario> alumnos = curso.getAlumnos();
        boolean esProfesorInvitado = alumnos != null && alumnos.stream()
                .anyMatch(u -> u.getEmail().equals(email) && u.getRol() == Usuario.Rol.profesor);
        if (esProfesorInvitado) return;
        throw new RuntimeException("No tienes permiso");
    }

    // Lista los cursos del usuario: si es profesor devuelve los suyos, si es alumno los en que está inscrito
    public List<CursoDTO> listarMisCursos(String email) {
        Usuario usuario = getUsuario(email);
        List<Curso> cursos = usuario.getRol() == Usuario.Rol.profesor
                ? cursoRepository.findByProfesorOrInvitado(usuario)
                : cursoRepository.findByAlumnosContaining(usuario);
        return cursos.stream().map(this::toDTO).toList();
    }

    // Devuelve el DTO de un curso por ID
    public CursoDTO obtener(Integer id) {
        return toDTO(getCurso(id));
    }

    // Crea un curso nuevo asignando al usuario autenticado como profesor
    public CursoDTO crear(String nombre, String descripcion, String color, String email) {
        Usuario profesor = getUsuario(email);
        Curso curso = new Curso();
        curso.setNombre(nombre);
        curso.setDescripcion(descripcion);
        curso.setColor(color != null ? color : "#24833D");
        curso.setProfesor(profesor);
        return toDTO(cursoRepository.save(curso));
    }

    // Actualiza nombre, descripción y color del curso
    public CursoDTO actualizar(Integer id, String nombre, String descripcion, String color, String email) {
        Curso curso = getCurso(id);
        verificarProfesor(curso, email);
        curso.setNombre(nombre);
        curso.setDescripcion(descripcion);
        if (color != null) curso.setColor(color);
        return toDTO(cursoRepository.save(curso));
    }

    // Elimina un curso y todo su contenido
    public void eliminar(Integer id, String email) {
        Curso curso = getCurso(id);
        verificarProfesor(curso, email);
        cursoRepository.delete(curso);
    }

    // Lista al profesor y alumnos de un curso como DTOs
    public List<ParticipanteDTO> listarParticipantes(Integer id, String email) {
        Curso curso = getCurso(id);
        List<ParticipanteDTO> lista = new java.util.ArrayList<>();
        if (curso.getProfesor() != null) {
            lista.add(new ParticipanteDTO(curso.getProfesor().getId(), curso.getProfesor().getNombre(),
                    curso.getProfesor().getEmail(), "profesor"));
        }
        if (curso.getAlumnos() != null) {
            curso.getAlumnos().stream()
                    .map(a -> new ParticipanteDTO(a.getId(), a.getNombre(), a.getEmail(), a.getRol().name()))
                    .forEach(lista::add);
        }
        return lista;
    }

    // Añade un usuario como alumno al curso si no está ya inscrito
    public CursoDTO invitarAlumno(Integer id, String emailAlumno, String emailProfesor) {
        Curso curso = getCurso(id);
        verificarProfesor(curso, emailProfesor);
        Usuario participante = usuarioRepository.findByEmail(emailAlumno)
                .orElseThrow(() -> new RuntimeException("No se encontró ningún usuario con ese email"));
        if (!curso.getAlumnos().contains(participante)) {
            curso.getAlumnos().add(participante);
            cursoRepository.save(curso);
        }
        return toDTO(curso);
    }

    // Elimina a un alumno del curso por su ID
    public void quitarAlumno(Integer id, Integer alumnoId, String email) {
        Curso curso = getCurso(id);
        verificarProfesor(curso, email);
        curso.getAlumnos().removeIf(a -> a.getId().equals(alumnoId));
        cursoRepository.save(curso);
    }

    // Lista las secciones de un curso ordenadas por posición
    public List<SeccionDTO> listarSecciones(Integer id, String email) {
        getCurso(id);
        return seccionRepository.findByCurso_IdOrderByOrdenAsc(id)
                .stream().map(this::toSeccionDTO).toList();
    }

    // Crea una nueva sección al final del curso
    public SeccionDTO crearSeccion(Integer cursoId, String titulo, String email) {
        Curso curso = getCurso(cursoId);
        verificarProfesor(curso, email);
        SeccionCurso sec = new SeccionCurso();
        sec.setTitulo(titulo);
        sec.setCurso(curso);
        sec.setOrden(seccionRepository.findByCurso_IdOrderByOrdenAsc(cursoId).size());
        return toSeccionDTO(seccionRepository.save(sec));
    }

    // Elimina una sección y todos sus elementos
    public void eliminarSeccion(Integer seccionId, String email) {
        SeccionCurso sec = seccionRepository.findById(seccionId)
                .orElseThrow(() -> new RuntimeException("Sección no encontrada"));
        verificarProfesor(sec.getCurso(), email);
        seccionRepository.delete(sec);
    }

    // Crea un nuevo elemento (texto, PDF, quiz, etc.) dentro de una sección
    public ElementoDTO crearElemento(Integer seccionId, String tipo, String titulo, String contenido, String email) {
        SeccionCurso sec = seccionRepository.findById(seccionId)
                .orElseThrow(() -> new RuntimeException("Sección no encontrada"));
        verificarProfesor(sec.getCurso(), email);
        ElementoCurso elem = new ElementoCurso();
        elem.setTipo(ElementoCurso.Tipo.valueOf(tipo));
        elem.setTitulo(titulo);
        elem.setContenido(contenido);
        elem.setSeccion(sec);
        elem.setOrden(sec.getElementos().size());
        ElementoCurso saved = elementoRepository.save(elem);
        return new ElementoDTO(saved.getId(), saved.getTipo().name(), saved.getTitulo(), saved.getContenido(), saved.getOrden());
    }

    // Actualiza el título de una sección
    public SeccionDTO editarSeccion(Integer seccionId, String titulo, String email) {
        SeccionCurso sec = seccionRepository.findById(seccionId)
                .orElseThrow(() -> new RuntimeException("Sección no encontrada"));
        verificarProfesor(sec.getCurso(), email);
        sec.setTitulo(titulo);
        return toSeccionDTO(seccionRepository.save(sec));
    }

    // Actualiza título y contenido de un elemento
    public ElementoDTO editarElemento(Integer elementoId, String titulo, String contenido, String email) {
        ElementoCurso elem = elementoRepository.findById(elementoId)
                .orElseThrow(() -> new RuntimeException("Elemento no encontrado"));
        verificarProfesor(elem.getSeccion().getCurso(), email);
        elem.setTitulo(titulo);
        elem.setContenido(contenido);
        ElementoCurso saved = elementoRepository.save(elem);
        return new ElementoDTO(saved.getId(), saved.getTipo().name(), saved.getTitulo(), saved.getContenido(), saved.getOrden());
    }

    // Elimina un elemento de su sección
    public void eliminarElemento(Integer elementoId, String email) {
        ElementoCurso elem = elementoRepository.findById(elementoId)
                .orElseThrow(() -> new RuntimeException("Elemento no encontrado"));
        verificarProfesor(elem.getSeccion().getCurso(), email);
        SeccionCurso sec = seccionRepository.findById(elem.getSeccion().getId())
                .orElseThrow(() -> new RuntimeException("Sección no encontrada"));
        sec.getElementos().removeIf(e -> e.getId().equals(elementoId));
        seccionRepository.save(sec);
    }

    // Devuelve las calificaciones de todos los quizzes del curso agrupadas por quiz
    public List<CalificacionQuizDTO> getCalificaciones(Integer cursoId) {
        Curso curso = cursoRepository.findById(cursoId).orElse(null);
        if (curso == null) return List.of();
        String profesorEmail = curso.getProfesor() != null ? curso.getProfesor().getEmail() : null;

        List<SeccionCurso> secciones = seccionRepository.findByCurso_IdOrderByOrdenAsc(cursoId);

        List<CalificacionQuizDTO> resultado = new ArrayList<>();

        for (SeccionCurso seccion : secciones) {
            for (ElementoCurso elem : seccion.getElementos()) {
                if (elem.getTipo() != ElementoCurso.Tipo.QUIZ || elem.getContenido() == null) continue;

                Integer quizId;
                try { quizId = Integer.parseInt(elem.getContenido()); } catch (NumberFormatException e) { continue; }

                Quiz quiz = quizRepository.findById(quizId).orElse(null);
                if (quiz == null) continue;

                List<Calificacion> cals = calificacionRepository.findByQuiz(quiz);

                List<CalificacionAlumnoDTO> alumnos = cals.stream()
                        .filter(c -> profesorEmail == null || !profesorEmail.equals(c.getUsuario().getEmail()))
                        .map(c -> new CalificacionAlumnoDTO(
                                c.getUsuario().getNombre(),
                                c.getUsuario().getEmail(),
                                c.getPuntuacion().doubleValue(),
                                (int) Math.round(c.getPuntuacion().doubleValue() * 10),
                                c.getFechaCompletado() != null ? c.getFechaCompletado().toLocalDate().toString() : null
                        ))
                        .sorted((a, b) -> Double.compare(b.puntuacion(), a.puntuacion()))
                        .toList();

                resultado.add(new CalificacionQuizDTO(quiz.getId(), quiz.getTitulo(), seccion.getTitulo(), alumnos));
            }
        }

        return resultado;
    }

    // Borra todas las calificaciones de un quiz concreto dentro del curso
    public void eliminarCalificacionesQuiz(Integer cursoId, Integer quizId, String email) {
        Curso curso = getCurso(cursoId);
        verificarProfesor(curso, email);
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz no encontrado"));
        calificacionRepository.deleteByQuiz(quiz);
    }
}
