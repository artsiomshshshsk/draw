import './App.css';
import {getBoard} from '@/api/ApiClient.ts';
import {Input} from '@/components/ui/input.tsx';
import {DrawElement, DrawEvent} from '@/domain.ts';
import {useWebSocket} from '@/hooks/useWebSocket.ts';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import rough from 'roughjs';
import ToolBar from "@/components/ToolBar.tsx";
import useAction from "@/hooks/useAction.ts";
import {updateRoughElement, createRoughElement} from "@/elementFactory.ts";
import {getElementAtPosition} from "@/lib/utils.ts";
import ActionBar from "@/components/ActionBar.tsx";
import usePressedKeys from "@/hooks/usePressedKeys.ts";

function App() {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const {
        action,
        setAction,
        elements,
        setElements,
        tool,
        setTool,
        addNewElement,
        updateElement,
        selectedElementId,
        startMovingElement,
        moveElement,
        stopMovingElement
    } = useAction('LINE');
    const [username,] = useState<string>(`user-${Math.floor(Math.random() * 1000)}`);
    const [room,] = useState<string | undefined>('artsiRoom');

    const [scale, setScale] = useState<number>(1);
    const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({x: 0, y: 0});
    const [scaleOffset, setScaleOffset] = useState<{ x: number; y: number }>({x: 0, y: 0});
    const pressedKeys = usePressedKeys();

    const onZoom = (delta: number) => {
        setScale((prevScale) => Math.min(20, Math.max(0.1, prevScale + delta)));
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const zoomFunction = (event: WheelEvent) => {
            if (event.ctrlKey) {
                event.preventDefault();
                onZoom(event.deltaY * -0.01);
            }
        };
        canvas.addEventListener('wheel', zoomFunction);

        return () => {
            canvas.removeEventListener('wheel', zoomFunction);
        };
    }, [pressedKeys]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const panFunction = (event: WheelEvent) => {
            if (!event.ctrlKey) {
                event.preventDefault();
                setPanOffset((prevOffset) => ({
                    x: prevOffset.x - event.deltaX,
                    y: prevOffset.y - event.deltaY
                }));
            }
        };
        canvas.addEventListener('wheel', panFunction);

        return () => {
            canvas.removeEventListener('wheel', panFunction);
        };
    }, []);


    useEffect(() => {
        getBoard().then((board: DrawElement[]) => {
            setElements(board.map(element => {
                return {...element, roughElement: updateRoughElement(element)};
            }));
        });
    }, [setElements]);


    const sendDrawEvent = useWebSocket({
        url: '/api/ws',
        subscribeTo: `/topic/draw/${room}`,
        onEvent: (drawEvent: any) => {
            const event: DrawEvent = JSON.parse(drawEvent.body);
            if (event.userId == username) return;

            if (event.type === 'CREATE') {
                const newElement = {...event.element, roughElement: updateRoughElement(event.element)};
                addNewElement(newElement);
            }

            if (event.type === 'UPDATE') {
                updateElement(event.element);
            }
        }
    });

    const getMouseCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const clientX = (event.clientX - panOffset.x * scale + scaleOffset.x) / scale;
        const clientY = (event.clientY - panOffset.y * scale + scaleOffset.y) / scale;
        return {clientX, clientY};
    }

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!username) return;

        const {clientX, clientY} = getMouseCoordinates(event)
        if (tool === 'SELECT') {
            const clickedElement = getElementAtPosition(clientX, clientY, elements);
            if (clickedElement) {
                setAction({action: 'SELECTION', elementId: clickedElement.id});
                startMovingElement(clickedElement.id, clientX, clientY);
                return;
            }
        } else {
            createRoughElement(clientX, clientY, clientX, clientY, tool).then((createdElement) => {
                setAction({action: 'DRAWING', elementId: createdElement.id});
                addNewElement(createdElement);

                sendDrawEvent(
                    `/app/draw/${room}`,
                    JSON.stringify({element: createdElement, type: 'CREATE', userId: username})
                );
            });
        }
    };

    const handleMouseUp = (_: React.MouseEvent<HTMLCanvasElement>) => {
        if (!username) return;

        if (action.action === 'SELECTION') {
            stopMovingElement();
            setAction({action: 'NONE', elementId: undefined});
        }

        if (action.action === 'DRAWING') {
            setAction({action: 'NONE', elementId: undefined});
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!username) return;

        const {clientX, clientY} = getMouseCoordinates(event)
        const canvas = canvasRef.current;

        if (action.action === 'SELECTION' && selectedElementId !== null) {
            moveElement(clientX, clientY);
            const element = elements.find(e => e.id === selectedElementId);
            if (element) {
                sendDrawEvent(
                    `/app/draw/${room}`,
                    JSON.stringify({element, type: 'UPDATE', userId: username})
                );
            }
            return;
        }

        if (action.action === 'DRAWING' && action.elementId !== undefined) {
            setElements((prevState) => {
                return prevState.map((element) => {
                    if (element.id === action.elementId) {
                        const updatedElement = {
                            ...element,
                            x2: clientX,
                            y2: clientY,
                            roughElement: updateRoughElement({...element, x2: clientX, y2: clientY})
                        };
                        sendDrawEvent(
                            `/app/draw/${room}`,
                            JSON.stringify({element: updatedElement, type: 'UPDATE', userId: username})
                        );
                        return updatedElement;
                    }
                    return element;
                });
            });
        }
        if (canvas) {
            const hoveredElement = getElementAtPosition(clientX, clientY, elements);
            if (hoveredElement && tool === 'SELECT') {
                if (hoveredElement.position === 'inside') {
                    canvas.style.cursor = 'move';
                } else if (hoveredElement.position === 'start' || hoveredElement.position === 'end') {
                    canvas.style.cursor = 'pointer';
                } else if (hoveredElement.position === 'topLeft' || hoveredElement.position === 'bottomRight') {
                    canvas.style.cursor = 'nwse-resize';
                } else if (hoveredElement.position === 'topRight' || hoveredElement.position === 'bottomLeft') {
                    canvas.style.cursor = 'nesw-resize';
                } else {
                    canvas.style.cursor = 'default';
                }
            } else {
                canvas.style.cursor = 'default';
            }
        }
    };

    useLayoutEffect(() => {
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d")!;
        const rc = rough.canvas(canvas);

        context.clearRect(0, 0, canvas.width, canvas.height);
        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;
        const scaledOffsetX = (scaledWidth - canvas.width) / 2;
        const scaledOffsetY = (scaledHeight - canvas.height) / 2;
        setScaleOffset({x: scaledOffsetX, y: scaledOffsetY})
        context.save();

        context.translate(panOffset.x * scale - scaledOffsetX, panOffset.y * scale - scaledOffsetY);
        context.scale(scale, scale);

        elements.forEach(({roughElement}) => rc.draw(roughElement));
        context.restore();

    }, [elements, scale, panOffset]);

    return (
        <div>
            <div className={'flex flex-row items-center fixed z-10 bg-amber-300 rounded m-2 p-2'}>
                <h1>Write your username here:</h1>
                <Input className={"w-24 m-4"} value={username} disabled={true}/>
            </div>
            <ToolBar tool={tool} setTool={setTool}/>
            <ActionBar scale={scale} setScale={setScale} onZoom={onZoom}/>
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className={'absolute bg-white z-1'}
            >
            </canvas>
        </div>
    );
}

export default App;
