package com.github.artsiomshshshsk.draw.domain;

import java.util.Map;

public record Room(
        String roomId,
        Map<Integer, DrawElement> board
){}