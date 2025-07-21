package com.teacher.managerment.service;

import com.teacher.managerment.dto.*;
import com.teacher.managerment.entity.*;
import com.teacher.managerment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseAssignmentRepository courseAssignmentRepository;

    @Autowired
    private CourseClassRepository courseClassRepository;

    @Autowired
    private UserRepository userRepository;

    // Course management methods
    public CourseDto createCourse(CreateCourseDto createDto, Long adminId) {
        // Check if course code already exists
        if (courseRepository.existsByCourseCode(createDto.getCourseCode())) {
            throw new RuntimeException("Mã môn học đã tồn tại");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));

        Course course = new Course(
                createDto.getCourseCode(),
                createDto.getCourseName(),
                createDto.getDescription(),
                createDto.getTeachingMaterials(),
                createDto.getReferenceMaterials(),
                admin
        );

        Course savedCourse = courseRepository.save(course);
        return new CourseDto(savedCourse);
    }

    public List<CourseDto> getAllCourses() {
        List<Course> courses = courseRepository.findAllActiveOrderByCreatedAtDesc();
        return courses.stream().map(CourseDto::new).collect(Collectors.toList());
    }

    public Optional<CourseDto> getCourseById(Long courseId) {
        return courseRepository.findById(courseId)
                .filter(Course::getActive)
                .map(CourseDto::new);
    }

    public CourseDto updateCourse(Long courseId, UpdateCourseDto updateDto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học"));

        if (!course.getActive()) {
            throw new RuntimeException("Môn học đã bị vô hiệu hóa");
        }

        course.setCourseName(updateDto.getCourseName());
        course.setDescription(updateDto.getDescription());
        course.setTeachingMaterials(updateDto.getTeachingMaterials());
        course.setReferenceMaterials(updateDto.getReferenceMaterials());

        Course savedCourse = courseRepository.save(course);
        return new CourseDto(savedCourse);
    }

    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học"));

        // Soft delete - set active to false
        course.setActive(false);
        courseRepository.save(course);

        // Also deactivate all assignments and classes
        List<CourseAssignment> assignments = courseAssignmentRepository.findByCourseIdAndActiveTrue(courseId);
        assignments.forEach(assignment -> assignment.setActive(false));
        courseAssignmentRepository.saveAll(assignments);

        List<CourseClass> classes = courseClassRepository.findByCourseIdAndActiveTrue(courseId);
        classes.forEach(courseClass -> courseClass.setActive(false));
        courseClassRepository.saveAll(classes);
    }

    // Course assignment methods
    public CourseAssignmentDto assignTeacherToCourse(CreateCourseAssignmentDto assignmentDto, Long adminId) {
        Course course = courseRepository.findById(assignmentDto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học"));

        if (!course.getActive()) {
            throw new RuntimeException("Môn học đã bị vô hiệu hóa");
        }

        User teacher = userRepository.findById(assignmentDto.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giáo viên"));

        if (teacher.getRole() != User.Role.TEACHER) {
            throw new RuntimeException("Người dùng không phải là giáo viên");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy admin"));

        // Check if assignment already exists
        if (courseAssignmentRepository.existsByCourseIdAndTeacherIdAndActiveTrue(
                assignmentDto.getCourseId(), assignmentDto.getTeacherId())) {
            throw new RuntimeException("Giáo viên đã được phân công cho môn học này");
        }

        CourseAssignment assignment = new CourseAssignment(course, teacher, admin);
        CourseAssignment savedAssignment = courseAssignmentRepository.save(assignment);
        return new CourseAssignmentDto(savedAssignment);
    }

    public List<CourseAssignmentDto> getCourseAssignments(Long courseId) {
        List<CourseAssignment> assignments = courseAssignmentRepository.findByCourseIdAndActiveTrue(courseId);
        return assignments.stream().map(CourseAssignmentDto::new).collect(Collectors.toList());
    }

    public List<CourseAssignmentDto> getTeacherAssignments(Long teacherId) {
        List<CourseAssignment> assignments = courseAssignmentRepository.findByTeacherIdAndActiveTrue(teacherId);
        return assignments.stream().map(CourseAssignmentDto::new).collect(Collectors.toList());
    }

    public void removeTeacherFromCourse(Long assignmentId) {
        CourseAssignment assignment = courseAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phân công"));

        // Soft delete - set active to false
        assignment.setActive(false);
        courseAssignmentRepository.save(assignment);

        // Also deactivate all classes taught by this teacher for this course
        List<CourseClass> classes = courseClassRepository.findByCourseIdAndTeacherIdAndActiveTrue(
                assignment.getCourse().getId(), assignment.getTeacher().getId());
        classes.forEach(courseClass -> courseClass.setActive(false));
        courseClassRepository.saveAll(classes);
    }

    public List<CourseDto> getCoursesByTeacherId(Long teacherId) {
        List<Course> courses = courseRepository.findByTeacherId(teacherId);
        return courses.stream().map(CourseDto::new).collect(Collectors.toList());
    }

    // Course class methods
    public CourseClassDto createCourseClass(CreateCourseClassDto createDto, Long createdById) {
        Course course = courseRepository.findById(createDto.getCourseId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học"));
        System.out.println ("Thông tin môn học: " + course.getCourseCode() + course.getCourseName() + course.getCreatedBy());
        if (!course.getActive()) {
            throw new RuntimeException("Môn học đã bị vô hiệu hóa");
        }

        for (CourseAssignment c : course.getAssignments()){
            System.out.println ("Thông tin giáo viên: " + c.getTeacher().getUsername() + c.getTeacher().getFullName() + c.getTeacher().getEmail());
            User createdBy = userRepository.findById(createdById)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người tạo"));
            // Verify teacher is assigned to this course
            if (!courseAssignmentRepository.existsByCourseIdAndTeacherIdAndActiveTrue(
                    createDto.getCourseId(), c.getTeacher().getId())) {
                throw new RuntimeException("Giáo viên chưa được phân công cho môn học này");
            }
            CourseClass courseClass = new CourseClass(
                    course,
                    c.getTeacher(),
                    createDto.getClassName(),
                    createDto.getSchedule(),
                    createDto.getStudentList(),
                    createdBy
            );

            CourseClass savedClass = courseClassRepository.save(courseClass);
            return new CourseClassDto(savedClass);
        }
        return null;
    }

    public List<CourseClassDto> getCourseClasses(Long courseId) {
        List<CourseClass> classes = courseClassRepository.findByCourseIdAndActiveTrue(courseId);
        return classes.stream().map(CourseClassDto::new).collect(Collectors.toList());
    }

    public List<CourseClassDto> getCourseClassesByTeacher(Long courseId, Long teacherId) {
        List<CourseClass> classes = courseClassRepository.findByCourseIdAndTeacherIdAndActiveTrue(courseId, teacherId);
        return classes.stream().map(CourseClassDto::new).collect(Collectors.toList());
    }

    public List<CourseClassDto> getTeacherClasses(Long teacherId) {
        List<CourseClass> classes = courseClassRepository.findByTeacherIdAndActiveTrue(teacherId);
        return classes.stream().map(CourseClassDto::new).collect(Collectors.toList());
    }

    public Optional<CourseClassDto> getCourseClassById(Long classId) {
        return courseClassRepository.findById(classId)
                .filter(CourseClass::getActive)
                .map(CourseClassDto::new);
    }

    public CourseClassDto updateCourseClass(Long classId, UpdateCourseClassDto updateDto) {
        CourseClass courseClass = courseClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));

        if (!courseClass.getActive()) {
            throw new RuntimeException("Lớp học đã bị vô hiệu hóa");
        }

        courseClass.setClassName(updateDto.getClassName());
        courseClass.setSchedule(updateDto.getSchedule());
        courseClass.setStudentList(updateDto.getStudentList());

        CourseClass savedClass = courseClassRepository.save(courseClass);
        return new CourseClassDto(savedClass);
    }

    public void deleteCourseClass(Long classId) {
        CourseClass courseClass = courseClassRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));

        // Soft delete - set active to false
        courseClass.setActive(false);
        courseClassRepository.save(courseClass);
    }

    // Statistics methods
    public Long getTotalCoursesCount() {
        return courseRepository.countActiveCourses();
    }

    public Long getTotalAssignmentsCount() {
        return courseAssignmentRepository.countActiveAssignments();
    }

    public Long getTotalClassesCount() {
        return courseClassRepository.countActiveClasses();
    }
}