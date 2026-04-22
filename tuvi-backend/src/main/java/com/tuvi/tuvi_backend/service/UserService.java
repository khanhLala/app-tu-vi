package com.tuvi.tuvi_backend.service;

import com.tuvi.tuvi_backend.dto.request.PasswordChangeRequest;
import com.tuvi.tuvi_backend.dto.request.UserCreationRequest;
import com.tuvi.tuvi_backend.dto.request.UserUpdateRequest;
import com.tuvi.tuvi_backend.dto.response.UserResponse;
import com.tuvi.tuvi_backend.entity.Role;
import com.tuvi.tuvi_backend.entity.User;
import com.tuvi.tuvi_backend.exception.AppException;
import com.tuvi.tuvi_backend.enums.ErrorCode;
import com.tuvi.tuvi_backend.mapper.UserMapper;
import com.tuvi.tuvi_backend.repository.RoleRepository;
import com.tuvi.tuvi_backend.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    CloudinaryService cloudinaryService;

    public UserResponse createUser(UserCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        HashSet<Role> roles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            request.getRoles().forEach(roleName -> 
                roleRepository.findById(roleName).ifPresent(roles::add)
            );
        } else {
            // Assign default USER role
            roleRepository.findById("USER").ifPresent(roles::add);
        }
        user.setRoles(roles);

        User savedUser = userRepository.save(user);
        
        UserResponse userResponse = userMapper.toUserResponse(savedUser);
        userResponse.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        return userResponse;
    }

    public UserResponse getMyInfo() {
        var context = org.springframework.security.core.context.SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        UserResponse userResponse = userMapper.toUserResponse(user);
        userResponse.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        return userResponse;
    }

    public UserResponse updateMyInfo(UserUpdateRequest request) {
        var context = org.springframework.security.core.context.SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDob(request.getDob());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setAddress(request.getAddress());

        User savedUser = userRepository.save(user);
        UserResponse userResponse = userMapper.toUserResponse(savedUser);
        userResponse.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        return userResponse;
    }

    public void changePassword(PasswordChangeRequest request) {
        var context = org.springframework.security.core.context.SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_INCORRECT);
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORDS_NOT_MATCH);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public UserResponse updateAvatar(MultipartFile file) {
        var context = org.springframework.security.core.context.SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String imageUrl = cloudinaryService.uploadFile(file);
        user.setAvatarUrl(imageUrl);
        userRepository.save(user);

        UserResponse userResponse = userMapper.toUserResponse(user);
        userResponse.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        return userResponse;
    }

    // Admin methods
    public java.util.List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> {
                    UserResponse response = userMapper.toUserResponse(user);
                    response.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
                    return response;
                }).collect(Collectors.toList());
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        UserResponse response = userMapper.toUserResponse(user);
        response.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        return response;
    }

    public UserResponse updateUser(String id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDob(request.getDob());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setAddress(request.getAddress());
        
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            HashSet<Role> roles = new HashSet<>();
            request.getRoles().forEach(roleName -> 
                roleRepository.findById(roleName).ifPresent(roles::add)
            );
            user.setRoles(roles);
        }

        User savedUser = userRepository.save(user);
        UserResponse response = userMapper.toUserResponse(savedUser);
        response.setRoles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()));
        return response;
    }

    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        // Prevent deleting admin from this endpoint for safety (optional)
        if (user.getUsername().equals("admin")) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION); // Or a specific error
        }
        
        userRepository.deleteById(id);
    }
}
