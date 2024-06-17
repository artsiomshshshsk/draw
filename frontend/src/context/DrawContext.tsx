import { createContext, FC, ReactNode, useState } from 'react';

export interface DrawingState {
  username: string | undefined;
  room: string | undefined;
}

export interface DrawingContextProps {
  drawingState: DrawingState;
  setUserName: (username: string) => void;
  setRoom: (room: string) => void;
}

const initialState: DrawingState = {
  username: undefined,
  room: undefined,
};

export const DrawingContext = createContext<DrawingContextProps>({
  drawingState: initialState,
  setUserName: () => {},
  setRoom: () => {},
});


export const DrawingProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [drawingState, setDrawingState] = useState<DrawingState>(initialState);

  const setUserName = (username: string) => {
    setDrawingState({ ...drawingState, username });
  };

  const setRoom = (room: string) => {
    setDrawingState({ ...drawingState, room });
  };

  return (
    <DrawingContext.Provider value={{ drawingState, setUserName, setRoom }}>
      {children}
    </DrawingContext.Provider>
  );
}