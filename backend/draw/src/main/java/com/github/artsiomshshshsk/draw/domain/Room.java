package com.github.artsiomshshshsk.draw.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Document(collection = "rooms")
public record Room(
        @Id
        String roomId,
        Map<Integer, DrawElement> board
){}