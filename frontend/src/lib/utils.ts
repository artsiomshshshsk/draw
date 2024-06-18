import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {DrawElement} from "@/domain.ts";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

const distance = (a: { x: number, y: number }, b: { x: number, y: number }) => {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

export const getAdjustedElementCoordinates = (element: DrawElement) => {
    const {x1, x2, y1, y2, type} = element;
    if (type === "LINE") {
        if (x1 < x2 || (x1 === x2 && y1 < y2)) {
            return {x1, y1, x2, y2};
        } else {
            return {x1: x2, y1: y2, x2: x1, y2: y1};
        }
    } else if (type === "RECTANGLE") {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        return {x1: minX, y1: minY, x2: maxX, y2: maxY};
    }
    return {x1, y1, x2, y2};
}

const nearPoint = (x: number, y: number, x1: number, y1: number, name: string) => {
    return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;

}


const positionWithinElement = (x: number, y: number, element: DrawElement) => {
    const {x1, x2, y1, y2, type} = element;

    if (type === "LINE") {
        const distanceFromStart = distance({x, y}, {x: x1, y: y1});
        const distanceFromEnd = distance({x, y}, {x: x2, y: y2});
        const lineLength = distance({x: x1, y: y1}, {x: x2, y: y2});

        const start = nearPoint(x, y, x1, y1, "start");
        const end = nearPoint(x, y, x2, y2, "end");
        const inside = distanceFromStart + distanceFromEnd - lineLength < 2 ? "inside" : null;
        return start || end || inside;
    } else if (type === "RECTANGLE") {
        const topLeft = nearPoint(x, y, x1, y1, "topLeft");
        const topRight = nearPoint(x, y, x2, y1, "topRight");
        const bottomLeft = nearPoint(x, y, x1, y2, "bottomLeft");
        const bottomRight = nearPoint(x, y, x2, y2, "bottomRight");

        const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
        return topLeft || topRight || bottomLeft || bottomRight || inside;
    } else if (type === "CIRCLE") {
        const radius = distance({x: x1, y: y1}, {x: x2, y: y2})
        return distance({x, y}, {x: x1, y: y1}) <= radius ? "inside" : null;
    }
}

export const getElementAtPosition = (x: number, y: number, elements: DrawElement[]) => {
    return elements
        .map(element => ({ ...element, position: positionWithinElement(x, y, element) }))
        .find(element => element.position !== null);

};

export const getCursorStyle = (position: string | null) => {
    switch (position) {
        case "start":
        case "end":
        case "topLeft":
        case "bottomRight":
            return "nwse-resize";
        case "topRight":
        case "bottomLeft":
            return "nesw-resize";
        case "inside":
            return "move";
        default:
            return "default";
    }
}
