package com.github.artsiomshshshsk.draw.domain;

public record DrawElement(
        Integer x1,
        Integer y1,
        Integer x2,
        Integer y2,
        Integer id,
        DrawElementType type,
        String text
) {
}