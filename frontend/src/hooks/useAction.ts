import React, {useState} from 'react';
import {DrawElement} from '@/domain.ts';
import {updateRoughElement} from '@/elementFactory.ts';
import {getAdjustedElementCoordinates, resizedCoordinates} from "@/lib/utils.ts";

type ActionType = 'DRAWING' | 'NONE' | 'RESIZING' | 'MOVING' | 'PANNING' | 'WRITING';

type ActionState = {
    action: ActionType;
    elementId: number | null;
    resizeHandle?: string;
};

const useAction = (elements: DrawElement[], setElements: React.Dispatch<React.SetStateAction<DrawElement[]>>, selectedElementId: number | null, setSelectedElementId:React.Dispatch<React.SetStateAction<number | null>> ) => {
    const [action, setAction] = useState<ActionState>({action: 'NONE', elementId: null});
    const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);

    const addNewElement = (newElement: DrawElement) => {
        setElements((prevState) => [...prevState, newElement]);
    };

    const updateElement = (updatedElement: DrawElement) => {
        const adjustedCoordinates = getAdjustedElementCoordinates(updatedElement);
        setElements((prevState) => {
            return prevState.map((element) => {
                if (element.id === updatedElement.id) {
                    const adjustedElement = { ...updatedElement, ...adjustedCoordinates };
                    return {
                        ...adjustedElement,
                        roughElement: updateRoughElement(adjustedElement)
                    };
                }
                return element;
            });
        });
    };

    const selectElement = (id: number | null) => {
        setSelectedElementId(id);
    };

    const startMovingElement = (id: number, x: number, y: number) => {
        const element = elements.find(e => e.id === id);
        if (element) {
            setAction({action: 'MOVING', elementId: id});
            setOffset({x: x - element.x1, y: y - element.y1});
            selectElement(id);
        }
    };

    const moveElement = (x: number, y: number) => {
        if (selectedElementId !== null && offset) {
            setElements((prevState) => {
                return prevState.map((element) => {
                    if (element.id === selectedElementId) {
                        return {
                            ...element,
                            x1: x - offset.x,
                            y1: y - offset.y,
                            x2: x - offset.x + (element.x2 - element.x1),
                            y2: y - offset.y + (element.y2 - element.y1),
                            roughElement: updateRoughElement({
                                ...element,
                                x1: x - offset.x,
                                y1: y - offset.y,
                                x2: x - offset.x + (element.x2 - element.x1),
                                y2: y - offset.y + (element.y2 - element.y1)
                            })
                        };
                    }
                    return element;
                });
            });
        }
    };

    const stopMovingElement = () => {
        if (selectedElementId !== null) {
            selectElement(null);
            setOffset(null);
            setAction({ action: 'NONE', elementId: null })
        }
    };


    const startResizingElement = (id: number, handle: string) => {
        selectElement(id);
        setAction({ action: 'RESIZING', elementId: id, resizeHandle: handle });
    };

    const resizeElement = (x: number, y: number) => {
        if (selectedElementId !== null && action.resizeHandle) {
            setElements((prevState) => {
                return prevState.map((element) => {
                    if (element.id === selectedElementId) {
                        const newCoordinates = resizedCoordinates(x, y, action.resizeHandle!, element);
                        return {
                            ...element,
                            ...newCoordinates,
                            roughElement: updateRoughElement(newCoordinates)
                        };
                    }
                    return element;
                });
            });
        }
    };

    const stopResizingElement = () => {
        if (selectedElementId !== null) {
            setAction({ action: 'NONE', elementId: null });
        }
    };

    const updateText = (text: string) => {
        const textHeight = 20;
        const textWidth = text.length * 10;
        setElements((prevState) => {
            return prevState.map((element) => {
                if (element.id === selectedElementId) {
                    return {
                        ...element,
                        text,
                        x2: element.x1 + textWidth,
                        y2: element.y1 + textHeight,
                        roughElement: updateRoughElement({
                            ...element,
                            text,
                            x2: element.x1 + textWidth,
                            y2: element.y1 + textHeight
                        })
                    };
                }
                return element;
            });
        });
        selectElement(null)
        setAction({ action: 'NONE', elementId: null })
    };

    const addTextElement = (x: number, y: number) => {
        const id = elements.length ? elements[elements.length - 1].id + 1 : 1;
        const newTextElement: DrawElement = {
            x1: x,
            y1: y,
            x2: x,
            y2: y,
            roughElement: null,
            id: id,
            type: 'TEXT',
            text: ' '
        };
        addNewElement(newTextElement);
        setAction({ action: 'WRITING', elementId: id });
        selectElement(id);
    };

    return {
        action,
        setAction,
        addNewElement,
        updateElement,
        startMovingElement,
        moveElement,
        stopMovingElement,
        startResizingElement,
        resizeElement,
        stopResizingElement,
        updateText,
        addTextElement
    };
};

export default useAction;
