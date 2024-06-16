import './App.css';
import {getBoard} from '@/api/ApiClient.ts';
import {Input} from '@/components/ui/input.tsx';
import {DrawElement, DrawEvent} from '@/domain.ts';
import {useWebSocket} from '@/hooks/useWebSocket.ts';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import rough from 'roughjs';
import ToolBar from "@/components/ToolBar.tsx";
import useAction from "@/hooks/useAction.ts";
import {updateRoughElement, createElement} from "@/elementFactory.ts";
import {getElementAtPosition} from "@/lib/utils.ts";

function App() {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { action, setAction, elements, setElements, tool, setTool, addNewElement, updateElement, selectedElementId, startMovingElement, moveElement, stopMovingElement } = useAction('LINE');
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
        if (tool === 'SELECT') {
            const clickedElement = getElementAtPosition(clientX, clientY, elements);
            if (clickedElement) {
                setAction({ action: 'selection', elementId: clickedElement.id });
                startMovingElement(clickedElement.id, clientX, clientY);
                return;
            }
        } else {
            createElement(clientX, clientY, clientX, clientY, tool).then((createdElement) => {
                setAction({ action: 'drawing', elementId: createdElement.id });
                addNewElement(createdElement);

                sendDrawEvent(
                    `/app/draw/${room}`,
                    JSON.stringify({ element: createdElement, type: 'CREATE', userId: username })
                );
            });
        }
    };

    const handleMouseUp = (_: React.MouseEvent<HTMLCanvasElement>) => {
        if (!username) return;

        if (selectedElementId !== null) {
            const element = elements.find(e => e.id === selectedElementId);
            if (element) {
                sendDrawEvent(
                    `/app/draw/${room}`,
                    JSON.stringify({ element, type: 'UPDATE', userId: username })
                );
            }
            stopMovingElement();
        }

        if (action.action === 'drawing') {
            setAction({ action: 'none', elementId: undefined });
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
        if (!username) return;

        const { clientX, clientY } = event;
        const canvas = canvasRef.current;

        if (action.action === 'selection' && selectedElementId !== null) {
            moveElement(clientX, clientY);
            return;
        }

        if (action.action === 'drawing' && action.elementId !== undefined) {
            setElements((prevState) => {
                return prevState.map((element) => {
                    if (element.id === action.elementId) {
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
        }

        if (canvas) {
            const hoveredElement = getElementAtPosition(clientX, clientY, elements);
            canvas.style.cursor = hoveredElement && tool === 'SELECT' ? 'move' : 'default';
        }
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
