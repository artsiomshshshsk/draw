import './App.css';
import {generateId, getBoard} from '@/api/ApiClient.ts';
import {Input} from '@/components/ui/input.tsx';
import {DrawElement, DrawElementType, DrawEvent} from '@/domain.ts';
import {useWebSocket} from '@/hooks/useWebSocket.ts';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import rough from 'roughjs';
import ToolBar from "@/components/ToolBar.tsx";

const generator = rough.generator();

const createElement = async (x1: number, y1: number, x2: number, y2: number, type: DrawElementType): Promise<DrawElement> => {
    let roughElement;
    const id = await generateId();

    if (type === 'LINE') {
        roughElement = generator.line(x1, y1, x2, y2);
    } else if (type === 'RECTANGLE') {
        roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
    }

    return {x1, y1, x2, y2, roughElement, id, type};
};

type DrawingState = {
    drawing: boolean;
    elementId: number | undefined;
}

function App() {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [drawing, setDrawing] = useState<DrawingState>({drawing: false, elementId: undefined});
    const [elements, setElements] = useState<DrawElement[]>([]);
    const [username,] = useState<string>(`user-${Math.floor(Math.random() * 1000)}`);
    const [room,] = useState<string | undefined>('artsiRoom');
    const [tool, setTool] = useState<DrawElementType>('LINE');

    useEffect(() => {
        getBoard().then((board: DrawElement[]) => {
            setElements(board.map(element => {
                let roughElement;
                if (element.type === 'LINE') {
                    roughElement = generator.line(element.x1, element.y1, element.x2, element.y2);
                } else if (element.type === 'RECTANGLE') {
                    roughElement = generator.rectangle(element.x1, element.y1, element.x2 - element.x1, element.y2 - element.y1);
                }
                return {...element, roughElement};
            }));
        })
    }, []);

    const addNewElement = (newElement: DrawElement) => {
        setElements((prevState) => [...prevState, newElement]);
    };

    const updateElement = (updatedElement: DrawElement) => {
        setElements((prevState) => {
            return prevState.map((element) => {
                if (element.id === updatedElement.id) {
                    let roughElement;
                    if (updatedElement.type === 'LINE') {
                        roughElement = generator.line(updatedElement.x1, updatedElement.y1, updatedElement.x2, updatedElement.y2);
                    } else if (updatedElement.type === 'RECTANGLE') {
                        roughElement = generator.rectangle(updatedElement.x1, updatedElement.y1, updatedElement.x2 - updatedElement.x1, updatedElement.y2 - updatedElement.y1);
                    }
                    return {...updatedElement, roughElement};
                }
                return element;
            });
        });
    };

    const sendDrawEvent = useWebSocket({
        url: '/api/ws',
        subscribeTo: `/topic/draw/${room}`,
        onEvent: (drawEvent: any) => {
            const event: DrawEvent = JSON.parse(drawEvent.body);
            if (event.userId == username) return;

            if (event.type === 'CREATE') {
                let roughElement;
                if (event.element.type === 'LINE') {
                    roughElement = generator.line(event.element.x1, event.element.y1, event.element.x2, event.element.y2);
                } else if (event.element.type === 'RECTANGLE') {
                    roughElement = generator.rectangle(event.element.x1, event.element.y1, event.element.x2 - event.element.x1, event.element.y2 - event.element.y1);
                }
                const newElement = { ...event.element, roughElement };
                addNewElement(newElement);
            }

            if (event.type === 'UPDATE') {
                updateElement(event.element);
            }
        }
    });

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!username) return;


        const {clientX, clientY} = event;
        createElement(clientX, clientY, clientX, clientY, tool).then((createdElement) => {
            setDrawing({drawing: true, elementId: createdElement.id});

            setElements((prevState) => [...prevState, createdElement]);

            sendDrawEvent(
                `/app/draw/${room}`,
                JSON.stringify({element: createdElement, type: 'CREATE', userId: username})
            );
        });
    };

    const handleMouseUp = (_: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawing.drawing || !username || !drawing.elementId) return;
        setDrawing({drawing: false, elementId: undefined});
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawing.drawing || !drawing.elementId || !username) return;
        const {clientX, clientY} = event;

        setElements((prevState) => {
            return prevState.map((element) => {
                if (element.id === drawing.elementId) {
                    let roughElement;
                    if (element.type === 'LINE') {
                        roughElement = generator.line(element.x1, element.y1, clientX, clientY);
                    } else if (element.type === 'RECTANGLE') {
                        roughElement = generator.rectangle(element.x1, element.y1, clientX - element.x1, clientY - element.y1);
                    }
                    const updatedElement = {...element, x2: clientX, y2: clientY, roughElement};
                    sendDrawEvent(
                        `/app/draw/${room}`,
                        JSON.stringify({element: updatedElement, type: 'UPDATE', userId: username})
                    );
                    return updatedElement;
                }
                return element;
            });
        })
    };

    useLayoutEffect(() => {

        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d")!;
        const rc = rough.canvas(canvas);

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();

        elements.forEach(({roughElement}) => rc.draw(roughElement));
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
