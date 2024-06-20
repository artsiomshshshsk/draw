package com.github.artsiomshshshsk.draw.repository;

import com.github.artsiomshshshsk.draw.DrawController.Room;
import com.github.artsiomshshshsk.draw.domain.DrawElement;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@Slf4j
public class InMemoryRoomRepository implements RoomRepository{

    private final Map<String, Room> rooms = new ConcurrentHashMap<>();

    @Override
    public Optional<Room> findById(String roomId) {
        return Optional.of(rooms.get(roomId));
    }

    @Override
    public void saveElement(String roomId, DrawElement element) {
        findById(roomId).ifPresentOrElse(
                r -> r.board().put(element.id(), element),
                () -> log.warn("Room not found: {}", roomId)
        );
    }

    @Override
    public Room saveRoom(List<DrawElement> elements) {
        var roomId = UUID.randomUUID().toString();

        Map<Integer, DrawElement> elementsIndex = new HashMap<>();
        for(DrawElement el: elements) {
            elementsIndex.put(el.id(), el);
        }

        var room = new Room(roomId, elementsIndex);

        rooms.put(roomId, room);
        return room;
    }
}
