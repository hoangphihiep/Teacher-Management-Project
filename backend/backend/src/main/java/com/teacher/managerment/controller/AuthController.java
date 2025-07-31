package com.teacher.managerment.controller;

import com.teacher.managerment.dto.request.LoginRequest;
import com.teacher.managerment.dto.response.ApiResponse;
import com.teacher.managerment.dto.response.LoginResponse;
import com.teacher.managerment.entity.User;
import com.teacher.managerment.repository.UserRepository;
import com.teacher.managerment.security.JwtUtils;
import com.teacher.managerment.service.impl.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> authenticateUser(
            @RequestBody LoginRequest loginRequest,
            HttpServletResponse response) {

        try {
            System.out.println("🔍 Login attempt for username: " + loginRequest.getUsername());

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Get user from database to get the ID
            Optional<User> userOptional = userRepository.findByUsername(loginRequest.getUsername());
            if (!userOptional.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Không tìm thấy người dùng", null));
            }

            User user = userOptional.get();
            System.out.println("🔍 Found user: " + user.getUsername() + " with ID: " + user.getId());

            // Generate token with userId
            String jwt = jwtUtils.generateTokenFromUsernameAndId(userDetails.getUsername(), user.getId());

            // Set JWT as HTTP-only cookie
            Cookie jwtCookie = new Cookie("jwt", jwt);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(false); // Set to true in production with HTTPS
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(24 * 60 * 60); // 24 hours
            response.addCookie(jwtCookie);

            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setToken(jwt);
            loginResponse.setType("Bearer");
            loginResponse.setUsername(user.getUsername());
            loginResponse.setFullName(user.getFullName());
            loginResponse.setEmail(user.getEmail());
            loginResponse.setRole(user.getRole().name());

            System.out.println("🔍 Login successful for user: " + user.getUsername());

            return ResponseEntity.ok(new ApiResponse<>(true, "Đăng nhập thành công", loginResponse));

        } catch (Exception e) {
            System.out.println("❌ Login failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Tên đăng nhập hoặc mật khẩu không đúng", null));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logoutUser(HttpServletResponse response) {
        try {
            // Clear the JWT cookie
            Cookie jwtCookie = new Cookie("jwt", null);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(false);
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(0);
            response.addCookie(jwtCookie);

            return ResponseEntity.ok(new ApiResponse<>(true, "Đăng xuất thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Lỗi khi đăng xuất", null));
        }
    }
}
