package com.github.artsiomshshshsk.draw.repository;

import com.github.artsiomshshshsk.draw.DrawController;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface RoomRepository {
    Optional<DrawController.Room> findById(String roomId);

    void saveElement(String roomId, DrawController.DrawElement element);

    DrawController.Room saveRoom(List<DrawController.DrawElement> elements);
}
