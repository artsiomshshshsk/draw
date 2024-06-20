package com.github.artsiomshshshsk.draw;

import com.github.artsiomshshshsk.draw.domain.DrawElement;
import com.github.artsiomshshshsk.draw.domain.DrawEvent;
import com.github.artsiomshshshsk.draw.domain.DrawEventType;
import com.github.artsiomshshshsk.draw.repository.RoomRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DrawController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AtomicInteger elementIdGenerator = new AtomicInteger(0);

    private final RoomRepository roomRepository;

    @MessageMapping("/draw/{roomId}")
    public void handleDrawEvent(@DestinationVariable String roomId, DrawEvent event) {
        log.info("Room -> {},Received draw event: {}", roomId, event);
        messagingTemplate.convertAndSend("/topic/draw/" + roomId, event);
        if (List.of(DrawEventType.CREATE, DrawEventType.UPDATE).contains(event.type())) {
            roomRepository.saveElement(roomId, event.element());
        }
    }

    @MessageMapping("/cursor/{roomId}")
    public void handleCursorEvent(@DestinationVariable String roomId, CursorEvent event) {
        log.info("Room -> {},Received cursor event: {}", roomId, event);
        messagingTemplate.convertAndSend("/topic/cursor/" + roomId, event);
    }

    @GetMapping("/draw/generateId")
    public ResponseEntity<Integer> generateId() {
        var id = elementIdGenerator.incrementAndGet();
        log.info("Generated id: {}", id);
        return ResponseEntity.ok(id);
    }


    @GetMapping("/draw/board/{roomId}")
    public ResponseEntity<List<DrawElement>> getBoard(@PathVariable String roomId) {
        return roomRepository.findById(roomId)
                .map(r -> ResponseEntity.ok(List.copyOf(r.board.values())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/draw/room")
    public ResponseEntity<RoomResponse> createRoom(@RequestBody List<DrawElement> board) {
        List<DrawElement> elements = new ArrayList<>();
        if(board != null && !board.isEmpty()) {
            elements.addAll(board);
        }
        var newRoom = roomRepository.saveRoom(elements);
        return ResponseEntity.ok(new RoomResponse(newRoom.roomId));
    }

    public record RoomResponse(String roomId) {}


    public record CursorEvent(
            String userId,
            int x,
            int y
    ) {
    }

    public enum DrawElementType {
        LINE, RECTANGLE, CIRCLE, TEXT
    }


    public record Room(
            String roomId,
            Map<Integer, DrawElement> board
    ){}
}
