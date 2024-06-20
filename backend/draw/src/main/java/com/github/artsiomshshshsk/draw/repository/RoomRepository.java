package com.github.artsiomshshshsk.draw.repository;

import com.github.artsiomshshshsk.draw.DrawController;
import com.github.artsiomshshshsk.draw.domain.DrawElement;
import com.github.artsiomshshshsk.draw.domain.Room;

import java.util.List;
import java.util.Optional;

public interface RoomRepository {
    Optional<Room> findById(String roomId);

    void saveElement(String roomId, DrawElement element);

    Room saveRoom(List<DrawElement> elements);
}
