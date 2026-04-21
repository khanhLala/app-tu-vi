package com.tuvi.tuvi_backend.controller;

import com.tuvi.tuvi_backend.dto.ApiResponse;
import com.tuvi.tuvi_backend.dto.request.CommentRequest;
import com.tuvi.tuvi_backend.dto.request.PostRequest;
import com.tuvi.tuvi_backend.dto.request.ReportRequest;
import com.tuvi.tuvi_backend.dto.response.PostResponse;
import com.tuvi.tuvi_backend.service.PostService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PostController {

    PostService postService;

    @PostMapping
    public ApiResponse<PostResponse> createPost(@RequestBody PostRequest request) {
        return ApiResponse.<PostResponse>builder()
                .result(postService.createPost(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<PostResponse>> getFeed() {
        return ApiResponse.<List<PostResponse>>builder()
                .result(postService.getFeed())
                .build();
    }

    @PostMapping("/{postId}/like")
    public ApiResponse<Void> toggleLike(@PathVariable String postId) {
        postService.toggleLike(postId);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/{postId}/comments")
    public ApiResponse<Void> addComment(@PathVariable String postId, @RequestBody CommentRequest request) {
        postService.addComment(postId, request);
        return ApiResponse.<Void>builder().build();
    }

    @DeleteMapping("/{postId}")
    public ApiResponse<Void> deletePost(@PathVariable String postId) {
        postService.deletePost(postId);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/{postId}/report")
    public ApiResponse<Void> reportPost(@PathVariable String postId, @RequestBody ReportRequest request) {
        postService.reportPost(postId, request.getReason());
        return ApiResponse.<Void>builder().build();
    }
}
