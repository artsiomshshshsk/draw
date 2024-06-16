import { DrawElement } from '@/domain.ts';

export const generateId = async (): Promise<number> => {
  const response = await fetch("/api/draw/generateId")
  if(!response.ok) throw new Error("Failed to generate id");
  return await response.json()
}

export const getBoard = async (): Promise<DrawElement[]> => {
  return fetch(`/api/draw/board`).then(resp => {
    if (resp.ok) {
      return resp.json();
    }
    throw new Error('Failed to fetch board');
  })
}