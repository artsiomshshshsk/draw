

export type DrawElementType = 'LINE'

export type DrawElement = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roughElement: any;
  id: number;
  type: DrawElementType;
};

export type DrawEvent = {
  element: DrawElement;
  type: 'CREATE' | 'UPDATE';
  userId?: string;
}