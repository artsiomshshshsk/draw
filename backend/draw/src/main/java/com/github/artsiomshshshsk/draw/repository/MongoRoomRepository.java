package com.github.artsiomshshshsk.draw.repository;

import com.github.artsiomshshshsk.draw.domain.DrawElement;
import com.github.artsiomshshshsk.draw.domain.Room;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@Primary
@AllArgsConstructor
public class MongoRoomRepository implements RoomRepository {

    private final MongoTemplate mongoTemplate;

    @Override
    public Optional<Room> findById(String roomId) {
        Query query = new Query(Criteria.where("roomId").is(roomId));
        Room room = mongoTemplate.findOne(query, Room.class);
        return Optional.ofNullable(room);
    }

    @Override
    public void saveElement(String roomId, DrawElement element) {
        Query query = new Query(Criteria.where("roomId").is(roomId));
        Update update = new Update().set("board." + element.id(), element);
        mongoTemplate.updateFirst(query, update, Room.class);
    }

    @Override
    public Room saveRoom(List<DrawElement> elements) {
        String roomId = generateRoomId(); // Implement this method to generate unique roomId
        Map<Integer, DrawElement> board = elements.stream()
                .collect(Collectors.toMap(
                        DrawElement::id,
                        element -> element,
                        (existing, replacement) -> {
                            return existing; // Keep the existing element in case of a duplicate
                        }
                ));
        Room room = new Room(roomId, board);
        return mongoTemplate.save(room);
    }

    private String generateRoomId() {
        return UUID.randomUUID().toString();
    }
}
