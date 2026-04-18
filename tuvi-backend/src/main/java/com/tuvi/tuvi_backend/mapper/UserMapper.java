package com.tuvi.tuvi_backend.mapper;

import com.tuvi.tuvi_backend.dto.request.UserCreationRequest;
import com.tuvi.tuvi_backend.dto.response.UserResponse;
import com.tuvi.tuvi_backend.entity.Role;
import com.tuvi.tuvi_backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);

    default Set<String> mapRoles(Set<Role> roles) {
        if (roles == null) return null;
        return roles.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }
}
