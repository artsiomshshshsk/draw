import { DrawElement } from '@/domain.ts';

export const generateId = async (): Promise<number> => {
  const response = await fetch("/api/draw/generateId")
  if(!response.ok) throw new Error("Failed to generate id");
  return await response.json()
}

export const getBoard = async (room: string): Promise<DrawElement[]> => {
  return fetch(`/api/draw/board/${room}`).then(resp => {
    if (resp.ok) {
      return resp.json();
    }
    throw new Error('Failed to fetch board');
  })
}

export const createRoom = async(board: DrawElement[]): Promise<{roomId: string }> => {
  const response = await fetch("/api/draw/room", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(board)
  });
  
  if(!response.ok) throw new Error("Failed to create room");
  
  // room id is returned
  return await response.json();
}
