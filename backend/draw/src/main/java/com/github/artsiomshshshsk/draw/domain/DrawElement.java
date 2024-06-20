package com.github.artsiomshshshsk.draw.domain;

import com.github.artsiomshshshsk.draw.DrawController;

public record DrawElement(
        Integer x1,
        Integer y1,
        Integer x2,
        Integer y2,
        Integer id,
        DrawController.DrawElementType type,
        String text
) {
}