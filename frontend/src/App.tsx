import './App.css';
import {getBoard} from '@/api/ApiClient.ts';
import {Input} from '@/components/ui/input.tsx';
import {DrawElement, DrawEvent} from '@/domain.ts';
import {useWebSocket} from '@/hooks/useWebSocket.ts';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import rough from 'roughjs';
import ToolBar from "@/components/ToolBar.tsx";
import useDrawing from "@/hooks/useDrawing.ts";
import {updateRoughElement, createElement} from "@/elementFactory.ts";

function App() {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { drawing, setDrawing, elements, setElements, tool, setTool, addNewElement, updateElement } = useDrawing('LINE');
    const [username,] = useState<string>(`user-${Math.floor(Math.random() * 1000)}`);
    const [room,] = useState<string | undefined>('artsiRoom');

    useEffect(() => {
        getBoard().then((board: DrawElement[]) => {
            setElements(board.map(element => {
                return { ...element, roughElement: updateRoughElement(element) };
            }));
        });
    }, []);


    const sendDrawEvent = useWebSocket({
        url: '/api/ws',
        subscribeTo: `/topic/draw/${room}`,
        onEvent: (drawEvent: any) => {
            const event: DrawEvent = JSON.parse(drawEvent.body);
            if (event.userId == username) return;

            if (event.type === 'CREATE') {
                const newElement = { ...event.element, roughElement: updateRoughElement(event.element) };
                addNewElement(newElement);
            }

            if (event.type === 'UPDATE') {
                updateElement(event.element);
            }
        }
    });

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!username) return;

        const { clientX, clientY } = event;
        createElement(clientX, clientY, clientX, clientY, tool).then((createdElement) => {
            setDrawing({ drawing: true, elementId: createdElement.id });
            addNewElement(createdElement);

            sendDrawEvent(
                `/app/draw/${room}`,
                JSON.stringify({ element: createdElement, type: 'CREATE', userId: username })
            );
        });
    };

    const handleMouseUp = (_: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawing.drawing || !username || !drawing.elementId) return;
        setDrawing({drawing: false, elementId: undefined});
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawing.drawing || !drawing.elementId || !username) return;
        const { clientX, clientY } = event;

        setElements((prevState) => {
            return prevState.map((element) => {
                if (element.id === drawing.elementId) {
                    const updatedElement = { ...element, x2: clientX, y2: clientY, roughElement: updateRoughElement({ ...element, x2: clientX, y2: clientY }) };
                    sendDrawEvent(
                        `/app/draw/${room}`,
                        JSON.stringify({ element: updatedElement, type: 'UPDATE', userId: username })
                    );
                    return updatedElement;
                }
                return element;
            });
        });
    };

    useLayoutEffect(() => {
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d")!;
        const rc = rough.canvas(canvas);

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();

        elements.forEach(({ roughElement }) => rc.draw(roughElement));
        context.restore();

    }, [elements]);

    return (
        <div>
            <div className={'flex flex-row items-center fixed z-10 bg-amber-300 rounded m-2 p-2'}>
                <h1>Write your username here:</h1>
                <Input className={"w-24 m-4"} value={username} disabled={true}/>
            </div>
            <ToolBar tool={tool} setTool={setTool}/>
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className={'absolute bg-white'}
            >
            </canvas>
        </div>
    );
}

export default App;
