import { useState } from 'react';
import { DrawElement, DrawElementType } from '@/domain.ts';
import { updateRoughElement } from '@/elementFactory.ts';

type DrawingState = {
    drawing: boolean;
    elementId: number | undefined;
};

const useDrawing = (initialTool: DrawElementType) => {
    const [drawing, setDrawing] = useState<DrawingState>({ drawing: false, elementId: undefined });
    const [elements, setElements] = useState<DrawElement[]>([]);
    const [tool, setTool] = useState<DrawElementType>(initialTool);

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

    return { drawing, setDrawing, elements, setElements, tool, setTool, addNewElement, updateElement };
};

export default useDrawing;
