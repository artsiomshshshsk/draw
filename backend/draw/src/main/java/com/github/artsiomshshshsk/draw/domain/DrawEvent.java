package com.github.artsiomshshshsk.draw.domain;


public record DrawEvent(
        DrawEventType type,
        String userId,
        DrawElement element
) {
}