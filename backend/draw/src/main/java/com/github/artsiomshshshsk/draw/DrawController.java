package com.github.artsiomshshshsk.draw;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.HtmlUtils;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DrawController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public Greeting greeting(HelloMessage message) throws Exception {
        Thread.sleep(1000); // simulated delay
        return new Greeting("Hello, " + HtmlUtils.htmlEscape(message.name()) + "!");
    }

    @MessageMapping("/draw/{roomId}")
    public void handleDrawEvent(@DestinationVariable String roomId, DrawEvent event) {
        log.info("Room -> {},Received draw event: {}", roomId, event);
        messagingTemplate.convertAndSend("/topic/draw/" + roomId, event);
    }


    public record HelloMessage(String name) {};

    public record Greeting(String content) {};

    public record DrawEvent(
            DrawEventType type,
            String userId,
            DrawElement element

    ) {}

    public enum DrawEventType {
        CREATE, UPDATE
    }


    public record DrawElement(
            Integer x1,
            Integer y1,
            Integer x2,
            Integer y2,
            Integer id,
            DrawElementType type
    ){}


    public enum DrawElementType {
        LINE
    }
}
