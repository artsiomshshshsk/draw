import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {DrawElement} from "@/domain.ts";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const distance = (a: { x: number, y: number }, b: { x: number, y: number }) => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function positionWithinElement(x: number, y: number, element: DrawElement) {
    const {x1, x2, y1, y2, type} = element;

    if (type === "LINE") {
        const distanceFromStart = distance({x, y}, {x: x1, y: y1});
        const distanceFromEnd = distance({x, y}, {x: x2, y: y2});
        const lineLength = distance({x: x1, y: y1}, {x: x2, y: y2});
        return distanceFromStart + distanceFromEnd - lineLength < 2;
    } else if (type === "RECTANGLE") {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    } else if (type === "CIRCLE") {
        const radius = distance({x: x1, y: y1}, {x: x2, y: y2})
        return distance({x, y}, {x: x1, y: y1}) <= radius;
    }
}

export const getElementAtPosition = (x: number, y: number, elements: DrawElement[]) => {
    return elements.find(element => positionWithinElement(x, y, element));
};
