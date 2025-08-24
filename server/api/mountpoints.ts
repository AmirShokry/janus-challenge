import { defineEventHandler, readBody } from "h3";
import type { Mountpoint } from "@@/shared/types";
const mountpoints: Mountpoint[] = [];
let nextId = 1;

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === "GET") return mountpoints;

  if (method === "POST") {
    const body = await readBody(event);
    const newMountpoint = {
      id: nextId++,
      description: body.description || `Mountpoint ${nextId}`,
      roomId: body.roomId || null,
      createdAt: new Date().toISOString(),
    };
    mountpoints.push(newMountpoint);
    return newMountpoint;
  }

  if (method === "DELETE") {
    const body = await readBody(event);
    if (!body.roomId) return { success: false };
    const roomId = body.roomId as number;

    const index = mountpoints.findIndex((mp) => mp.roomId === roomId);
    if (index === -1) return { success: false };

    mountpoints.splice(index, 1);
    return { success: true };
  }
});
