package com.quizsloth.service;

import com.quizsloth.model.*;
import com.quizsloth.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SeccionCursoRepository seccionRepository;
    private final ElementoCursoRepository elementoRepository;

    public record CursoDTO(Integer id, String nombre, String descripcion, String color,
                           int numAlumnos, ProfesorInfo profesor) {}
    public record ProfesorInfo(Integer id, String nombre, String email) {}
    public record SeccionDTO(Integer id, String titulo, Integer orden, List<ElementoDTO> elementos) {}
    public record ElementoDTO(Integer id, String tipo, String titulo, String contenido, Integer orden) {}
    public record ParticipanteDTO(Integer id, String nombre, String email, String rol) {}

    private CursoDTO toDTO(Curso c) {
        int num = c.getAlumnos() != null ? c.getAlumnos().size() : 0;
        ProfesorInfo prof = c.getProfesor() != null
                ? new ProfesorInfo(c.getProfesor().getId(), c.getProfesor().getNombre(), c.getProfesor().getEmail()) : null;
        return new CursoDTO(c.getId(), c.getNombre(), c.getDescripcion(), c.getColor(), num, prof);
    }

    private SeccionDTO toSeccionDTO(SeccionCurso s) {
        List<ElementoDTO> elems = s.getElementos().stream()
                .map(e -> new ElementoDTO(e.getId(), e.getTipo().name(), e.getTitulo(), e.getContenido(), e.getOrden()))
                .toList();
        return new SeccionDTO(s.getId(), s.getTitulo(), s.getOrden(), elems);
    }

    private Usuario getUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private Curso getCurso(Integer id) {
        return cursoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clase no encontrada"));
    }

    private void verificarProfesor(Curso curso, String email) {
        if (curso.getProfesor() != null && curso.getProfesor().getEmail().equals(email)) return;
        List<Usuario> alumnos = curso.getAlumnos();
        boolean esProfesorInvitado = alumnos != null && alumnos.stream()
                .anyMatch(u -> u.getEmail().equals(email) && u.getRol() == Usuario.Rol.profesor);
        if (esProfesorInvitado) return;
        throw new RuntimeException("No tienes permiso");
    }

    public List<CursoDTO> listarMisCursos(String email) {
        Usuario usuario = getUsuario(email);
        List<Curso> cursos = usuario.getRol() == Usuario.Rol.profesor
                ? cursoRepository.findByProfesorOrInvitado(usuario)
                : cursoRepository.findByAlumnosContaining(usuario);
        return cursos.stream().map(this::toDTO).toList();
    }

    public CursoDTO obtener(Integer id) {
        return toDTO(getCurso(id));
    }

    public CursoDTO crear(String nombre, String descripcion, String color, String email) {
        Usuario profesor = getUsuario(email);
        Curso curso = new Curso();
        curso.setNombre(nombre);
        curso.setDescripcion(descripcion);
        curso.setColor(color != null ? color : "#24833D");
        curso.setProfesor(profesor);
        return toDTO(cursoRepository.save(curso));
    }

    public CursoDTO actualizar(Integer id, String nombre, String descripcion, String color, String email) {
        Curso curso = getCurso(id);
        verificarProfesor(curso, email);
        curso.setNombre(nombre);
        curso.setDescripcion(descripcion);
        if (color != null) curso.setColor(color);
        return toDTO(cursoRepository.save(curso));
    }

    public void eliminar(Integer id, String email) {
        Curso curso = getCurso(id);
        verificarProfesor(curso, email);
        cursoRepository.delete(curso);
    }

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

    public void quitarAlumno(Integer id, Integer alumnoId, String email) {
        Curso curso = getCurso(id);
        verificarProfesor(curso, email);
        curso.getAlumnos().removeIf(a -> a.getId().equals(alumnoId));
        cursoRepository.save(curso);
    }

    public List<SeccionDTO> listarSecciones(Integer id, String email) {
        getCurso(id);
        return seccionRepository.findByCurso_IdOrderByOrdenAsc(id)
                .stream().map(this::toSeccionDTO).toList();
    }

    public SeccionDTO crearSeccion(Integer cursoId, String titulo, String email) {
        Curso curso = getCurso(cursoId);
        verificarProfesor(curso, email);
        SeccionCurso sec = new SeccionCurso();
        sec.setTitulo(titulo);
        sec.setCurso(curso);
        sec.setOrden(seccionRepository.findByCurso_IdOrderByOrdenAsc(cursoId).size());
        return toSeccionDTO(seccionRepository.save(sec));
    }

    public void eliminarSeccion(Integer seccionId, String email) {
        SeccionCurso sec = seccionRepository.findById(seccionId)
                .orElseThrow(() -> new RuntimeException("Sección no encontrada"));
        verificarProfesor(sec.getCurso(), email);
        seccionRepository.delete(sec);
    }

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

    public SeccionDTO editarSeccion(Integer seccionId, String titulo, String email) {
        SeccionCurso sec = seccionRepository.findById(seccionId)
                .orElseThrow(() -> new RuntimeException("Sección no encontrada"));
        verificarProfesor(sec.getCurso(), email);
        sec.setTitulo(titulo);
        return toSeccionDTO(seccionRepository.save(sec));
    }

    public ElementoDTO editarElemento(Integer elementoId, String titulo, String contenido, String email) {
        ElementoCurso elem = elementoRepository.findById(elementoId)
                .orElseThrow(() -> new RuntimeException("Elemento no encontrado"));
        verificarProfesor(elem.getSeccion().getCurso(), email);
        elem.setTitulo(titulo);
        elem.setContenido(contenido);
        ElementoCurso saved = elementoRepository.save(elem);
        return new ElementoDTO(saved.getId(), saved.getTipo().name(), saved.getTitulo(), saved.getContenido(), saved.getOrden());
    }

    public void eliminarElemento(Integer elementoId, String email) {
        ElementoCurso elem = elementoRepository.findById(elementoId)
                .orElseThrow(() -> new RuntimeException("Elemento no encontrado"));
        verificarProfesor(elem.getSeccion().getCurso(), email);
        elementoRepository.delete(elem);
    }
}
