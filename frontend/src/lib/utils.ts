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
    } else if (type === "CIRCLE") {
        return {x1, y1, x2, y2};
    } else if (type === "TEXT") {
        return {x1, y1, x2, y2};
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
        const radius = distance({x: x1, y: y1}, {x: x2, y: y2});
        const distanceFromCenter = distance({x, y}, {x: x1, y: y1});
        const nearEdge = Math.abs(distanceFromCenter - radius) < 5 ? "nearEdge" : null;
        const inside = distanceFromCenter < radius ? "inside" : null;
        return nearEdge || inside;
    } else if (type === "TEXT") {
        return x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
    }
}

export const getElementAtPosition = (x: number, y: number, elements: DrawElement[]) => {
    return elements
        .map(element => ({...element, position: positionWithinElement(x, y, element)}))
        .find(element => element.position !== null);

};

export const resizedCoordinates = (clientX: number, clientY: number, position: string, element: DrawElement) => {
    const {x1, y1, x2, y2} = element;

    switch (position) {
        case 'nearEdge':
            return {...element, x1, y1, x2: clientX, y2: clientY};
        case 'topLeft':
        case 'start':
            return {...element, x1: clientX, y1: clientY, x2, y2};

        case 'topRight':
            return {...element, x1, y1: clientY, x2: clientX, y2};

        case 'bottomLeft':
            return {...element, x1: clientX, y1, x2, y2: clientY};

        case 'bottomRight':
        case 'end':
            return {...element, x1, y1, x2: clientX, y2: clientY};

        default:
            return element;
    }
};

interface CursorCache {
    [key: string]: HTMLImageElement;
}

export const cursorCache: CursorCache = {};

export const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
<path d="M7.92098 2.29951C6.93571 1.5331 5.5 2.23523 5.5 3.48349V20.4923C5.5 21.9145 7.2945 22.5382 8.17661 21.4226L12.3676 16.1224C12.6806 15.7267 13.1574 15.4958 13.6619 15.4958H20.5143C21.9425 15.4958 22.5626 13.6887 21.4353 12.8119L7.92098 2.29951Z" fill="#212121"/>
  </svg>`

export const changeSvgColor = (color: string) => {
    return svgString.replace(/fill="#212121"/, `fill="${color}"`);
}

export const stringToColour = (usernameString: string) => {
    let hash = 0;
    const str = usernameString.split('-')[1];
    str.split('').forEach(char => {
        hash = char.charCodeAt(0) + ((hash << 5) - hash);
    });
    const hue = hash % 360;
    const saturation = 70;
    const lightness = 50;

    const hslToHex = (h: number, s: number, l: number) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    };

    return hslToHex(hue, saturation, lightness);
};
