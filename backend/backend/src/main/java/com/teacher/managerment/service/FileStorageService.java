package com.teacher.managerment.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.file.upload-dir:uploads}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB for images

    private static final String[] ALLOWED_EXTENSIONS = {
            ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".txt", ".rtf"
    };

    private static final String[] ALLOWED_IMAGE_EXTENSIONS = {
            ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"
    };

    // Original methods for course files
    public String storeFile(MultipartFile file, String category, Long courseId) throws IOException {
        // Validate file
        validateFile(file);

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, "courses", courseId.toString(), category);
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        // Store file
        Path targetLocation = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path
        return Paths.get("courses", courseId.toString(), category, uniqueFilename).toString();
    }

    public void deleteFile(String filePath) throws IOException {
        Path path = Paths.get(uploadDir, filePath);
        Files.deleteIfExists(path);
    }

    public Path getFilePath(String relativePath) {
        return Paths.get(uploadDir, relativePath);
    }

    public boolean fileExists(String relativePath) {
        return Files.exists(getFilePath(relativePath));
    }

    public String getContentType(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        switch (extension) {
            case ".pdf":
                return "application/pdf";
            case ".doc":
                return "application/msword";
            case ".docx":
                return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case ".ppt":
                return "application/vnd.ms-powerpoint";
            case ".pptx":
                return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case ".xls":
                return "application/vnd.ms-excel";
            case ".xlsx":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case ".txt":
                return "text/plain";
            case ".rtf":
                return "application/rtf";
            case ".jpg":
            case ".jpeg":
                return "image/jpeg";
            case ".png":
                return "image/png";
            case ".gif":
                return "image/gif";
            case ".bmp":
                return "image/bmp";
            case ".webp":
                return "image/webp";
            default:
                return "application/octet-stream";
        }
    }

    // New methods for certification images
    public String storeCertificationImage(MultipartFile file) throws IOException {
        // Validate image file
        validateImageFile(file);

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, "certifications");
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = "cert_" + UUID.randomUUID().toString() + fileExtension;

        // Store file
        Path targetLocation = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path (this is what will be saved to database)
        String relativePath = Paths.get("certifications", uniqueFilename).toString();

        System.out.println("File stored at: " + targetLocation.toString());
        System.out.println("Returning relative path: " + relativePath);

        // Return relative path
        return Paths.get("certifications", uniqueFilename).toString();
    }

    public Resource loadCertificationImage(String fileName) throws IOException {
        try {
            Path filePath = Paths.get(uploadDir, "certifications", fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new IOException("Certification image not found: " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new IOException("Certification image not found: " + fileName, ex);
        }
    }

    public void deleteCertificationImage(String relativePath) throws IOException {
        if (relativePath != null && !relativePath.isEmpty()) {
            Path path = Paths.get(uploadDir, relativePath);
            Files.deleteIfExists(path);
        }
    }

    // Private validation methods
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File không được để trống");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File quá lớn. Kích thước tối đa là 50MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("Tên file không hợp lệ");
        }

        String fileExtension = getFileExtension(originalFilename).toLowerCase();
        boolean isAllowed = false;
        for (String allowedExt : ALLOWED_EXTENSIONS) {
            if (fileExtension.equals(allowedExt)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            throw new RuntimeException("Định dạng file không được hỗ trợ. Chỉ chấp nhận: " + String.join(", ", ALLOWED_EXTENSIONS));
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Hình ảnh không được để trống");
        }

        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new RuntimeException("Hình ảnh quá lớn. Kích thước tối đa là 5MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("Tên file không hợp lệ");
        }

        String fileExtension = getFileExtension(originalFilename).toLowerCase();
        boolean isAllowed = false;
        for (String allowedExt : ALLOWED_IMAGE_EXTENSIONS) {
            if (fileExtension.equals(allowedExt)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            throw new RuntimeException("Định dạng hình ảnh không được hỗ trợ. Chỉ chấp nhận: " + String.join(", ", ALLOWED_IMAGE_EXTENSIONS));
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
}
