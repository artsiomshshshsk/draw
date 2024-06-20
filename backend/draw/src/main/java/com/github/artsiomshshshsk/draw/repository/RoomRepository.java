package com.github.artsiomshshshsk.draw.repository;

import com.github.artsiomshshshsk.draw.DrawController;
import com.github.artsiomshshshsk.draw.domain.DrawElement;

import java.util.List;
import java.util.Optional;

public interface RoomRepository {
    Optional<DrawController.Room> findById(String roomId);

    void saveElement(String roomId, DrawElement element);

    DrawController.Room saveRoom(List<DrawElement> elements);
}
