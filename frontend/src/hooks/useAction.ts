import {useState} from 'react';
import {DrawElement, DrawElementType} from '@/domain.ts';
import {updateRoughElement} from '@/elementFactory.ts';

type ActionType = 'drawing' | 'none' | 'selection';

type ActionState = {
    action: ActionType;
    elementId: number | undefined;
};

const useAction = (initialTool: DrawElementType) => {
    const [action, setAction] = useState<ActionState>({ action: 'none', elementId: undefined });
    const [elements, setElements] = useState<DrawElement[]>([]);
    const [tool, setTool] = useState<DrawElementType>(initialTool);
    const [selectedElementId, setSelectedElementId] = useState<number | null>(null);
    const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);


    const addNewElement = (newElement: DrawElement) => {
        setElements((prevState) => [...prevState, newElement]);
    };

    const updateElement = (updatedElement: DrawElement) => {
        setElements((prevState) => {
            return prevState.map((element) => {
                if (element.id === updatedElement.id) {
                    return { ...updatedElement, roughElement: updateRoughElement(updatedElement) };
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
            setOffset({ x: x - element.x1, y: y - element.y1 });
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
        }
    };

    return {
        action,
        setAction,
        elements,
        setElements,
        tool,
        setTool,
        addNewElement,
        updateElement,
        selectedElementId,
        selectElement,
        startMovingElement,
        moveElement,
        stopMovingElement
    };
};

export default useAction;