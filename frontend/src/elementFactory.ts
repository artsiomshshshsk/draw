import rough from 'roughjs';
import { DrawElement, DrawElementType } from '@/domain.ts';
import { generateId } from '@/api/ApiClient.ts';
import {RoughCanvas} from "roughjs/bin/canvas";

const generator = rough.generator();

const createRoughElement = async (x1: number, y1: number, x2: number, y2: number, type: DrawElementType): Promise<DrawElement> => {
    let roughElement;
    const id = await generateId();

    if (type === 'LINE') {
        roughElement = generator.line(x1, y1, x2, y2);
    } else if (type === 'RECTANGLE') {
        roughElement = generator.rectangle(x1, y1, x2 - x1, y2 - y1);
    } else if (type === 'CIRCLE') {
        const radius = Math.hypot(x2 - x1, y2 - y1);
        roughElement = generator.circle(x1, y1, radius * 2);
    }

    if (type === 'TEXT') {
        return { x1, y1, x2, y2, roughElement: null, id, type, text: " "};
    }

    return { x1, y1, x2, y2, roughElement, id, type };
};

const updateRoughElement = (element: DrawElement)=> {
    if (element.type === 'LINE') {
        return generator.line(element.x1, element.y1, element.x2, element.y2);
    } else if (element.type === 'RECTANGLE') {
        return generator.rectangle(element.x1, element.y1, element.x2 - element.x1, element.y2 - element.y1);
    } else if (element.type === 'CIRCLE') {
        const radius = Math.hypot(element.x2 - element.x1, element.y2 - element.y1);
        return generator.circle(element.x1, element.y1, radius * 2);
    } else if (element.type === 'TEXT') {
        return element;
    }
    return null;
};

const drawElement = (rc: RoughCanvas, context: CanvasRenderingContext2D, element: DrawElement) => {
    if (element.type === 'TEXT') {
        context.textBaseline = 'top';
        context.font = '20px sans-serif';
        context.fillText(element.text ? element.text : " ", element.x1, element.y1);
    } else {
        rc.draw(element.roughElement);
    }

}

export {  updateRoughElement, createRoughElement, drawElement };
