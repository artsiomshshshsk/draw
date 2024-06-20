package com.github.artsiomshshshsk.draw;

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

import java.util.UUID;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DrawController {

    private final SimpMessagingTemplate messagingTemplate;
    private final AtomicInteger elementIdGenerator = new AtomicInteger(0);
    private final Map<String, Room> rooms = new ConcurrentHashMap<>();

    @MessageMapping("/draw/{roomId}")
    public void handleDrawEvent(@DestinationVariable String roomId, DrawEvent event) {
        log.info("Room -> {},Received draw event: {}", roomId, event);
        messagingTemplate.convertAndSend("/topic/draw/" + roomId, event);
        if (List.of(DrawEventType.CREATE, DrawEventType.UPDATE).contains(event.type())) {
            Optional.of(rooms.get(roomId)).ifPresentOrElse(
                    r -> r.board().put(event.element().id(), event.element()),
                    () -> log.warn("Room not found: {}", roomId)
            );
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
        return Optional.ofNullable(rooms.get(roomId))
                .map(r -> ResponseEntity.ok(List.copyOf(r.board().values())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @PostMapping("/draw/room")
    public ResponseEntity<RoomResponse> createRoom(@RequestBody List<DrawElement> board) {
        Map<Integer, DrawElement> newBoard = new ConcurrentHashMap<>();
        if(board != null && !board.isEmpty()) {
            for(var element : board) {
                newBoard.put(element.id(), element);
            }
        }

        var roomId = UUID.randomUUID().toString();
        rooms.put(roomId, new Room(roomId, newBoard));
        return ResponseEntity.ok(new RoomResponse(roomId));
    }

    public record RoomResponse(String roomId) {}


    public record CursorEvent(
            String userId,
            int x,
            int y
    ) {
    }

    public record DrawEvent(
            DrawEventType type,
            String userId,
            DrawElement element
    ) {
    }

    public enum DrawEventType {
        CREATE, UPDATE
    }

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

    public enum DrawElementType {
        LINE, RECTANGLE, CIRCLE, TEXT
    }


    public record Room(
            String roomId,
            Map<Integer, DrawElement> board
    ){}
}
