export type DrawElementType = 'LINE' | 'RECTANGLE' | 'CIRCLE' | 'TEXT';

export type ToolType = DrawElementType | 'TRANSFORM'| 'PAN';

export type DrawElement = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roughElement: any;
  id: number;
  type: DrawElementType;
  text?: string;
};

export type DrawEvent = {
  element: DrawElement;
  type: 'CREATE' | 'UPDATE';
  userId?: string;
}