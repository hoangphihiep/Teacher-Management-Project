package com.teacher.managerment.controller;

import com.teacher.managerment.dto.response.ApiResponse;
import com.teacher.managerment.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/certification-images")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CertificationImageController {

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadCertificationImage(
            @RequestParam("file") MultipartFile file) {
        try {
            String imagePath = fileStorageService.storeCertificationImage(file);

            // Tạo response data với cả fileName và imageUrl
            Map<String, String> responseData = new HashMap<>();
            responseData.put("fileName", imagePath.substring(imagePath.lastIndexOf("/") + 1));
            responseData.put("imageUrl", imagePath);

            System.out.println("Upload successful - imagePath: " + imagePath);
            System.out.println("Response data: " + responseData);

            return ResponseEntity.ok(new ApiResponse<>(true, "Upload hình ảnh chứng chỉ thành công", responseData));
        } catch (Exception e) {
            System.err.println("Upload failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> getCertificationImage(@PathVariable String fileName) {
        try {
            Resource resource = fileStorageService.loadCertificationImage(fileName);
            String contentType = fileStorageService.getContentType(fileName);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{fileName}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCertificationImage(@PathVariable String fileName) {
        try {
            fileStorageService.deleteCertificationImage("certifications/" + fileName);
            return ResponseEntity.ok(new ApiResponse<>(true, "Xóa hình ảnh chứng chỉ thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
