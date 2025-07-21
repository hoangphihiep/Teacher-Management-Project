package com.teacher.managerment.service;

import com.teacher.managerment.dto.CreateUserDto;
import com.teacher.managerment.dto.UpdateUserDto;
import com.teacher.managerment.dto.UserDto;
import com.teacher.managerment.entity.User;
import com.teacher.managerment.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserDto> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream().map(UserDto::new).collect(Collectors.toList());
    }

    public Page<UserDto> getAllUsers(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        return users.map(UserDto::new);
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return new UserDto(user);
    }

    public UserDto createUser(CreateUserDto createDto) {
        // Check if username exists
        if (userRepository.existsByUsername(createDto.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }

        // Check if email exists
        if (userRepository.existsByEmail(createDto.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        User user = new User();
        user.setUsername(createDto.getUsername());
        user.setPassword(passwordEncoder.encode(createDto.getPassword()));
        user.setFullName(createDto.getFullName());
        user.setEmail(createDto.getEmail());
        user.setRole(User.Role.valueOf(createDto.getRole()));
        user.setEnabled(true);

        User savedUser = userRepository.save(user);
        return new UserDto(savedUser);
    }

    public UserDto updateUser(Long id, UpdateUserDto updateDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Check if email exists for other users
        if (!user.getEmail().equals(updateDto.getEmail()) &&
                userRepository.existsByEmail(updateDto.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        user.setFullName(updateDto.getFullName());
        user.setEmail(updateDto.getEmail());
        user.setRole(User.Role.valueOf(updateDto.getRole()));

        if (updateDto.getEnabled() != null) {
            user.setEnabled(updateDto.getEnabled());
        }

        User savedUser = userRepository.save(user);
        return new UserDto(savedUser);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        userRepository.delete(user);
    }


    public UserDto toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        user.setEnabled(!user.getEnabled());
        User savedUser = userRepository.save(user);
        return new UserDto(savedUser);
    }

    public List<UserDto> getUsersByRole(String role) {
        List<User> users = userRepository.findByRole(User.Role.valueOf(role));
        return users.stream().map(UserDto::new).collect(Collectors.toList());
    }

    public Long getTotalUsersCount() {
        return userRepository.count();
    }

    public Long getActiveUsersCount() {
        return userRepository.countByEnabled(true);
    }

    public Long getTeachersCount() {
        return userRepository.countByRole(User.Role.TEACHER);
    }

    public Long getAdminsCount() {
        return userRepository.countByRole(User.Role.ADMIN);
    }

    public Long getCurrentUserId(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return user.getId();
    }

    public List<UserDto> getAllTeachers() {
        List<User> teachers = userRepository.findByRole(User.Role.TEACHER);
        return teachers.stream().map(UserDto::new).collect(Collectors.toList());
    }
}
