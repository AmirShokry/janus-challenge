import { defineEventHandler, readBody } from "h3";
interface Mountpoint {
  id: number;
  description: string;
  roomId: number | null; // videoroom reference
  publisherId: number | null; // publisher's feed ID
  createdAt: string;
}
const mountpoints: Mountpoint[] = [];
let nextId = 1;

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method === "GET") return mountpoints;

  if (method === "POST") {
    // create a new mountpoint
    const body = await readBody(event);
    const newMountpoint = {
      id: nextId++,
      description: body.description || `Mountpoint ${nextId}`,
      roomId: body.roomId || null, // videoroom reference
      publisherId: body.publisherId || null, // publisher's feed ID
      createdAt: new Date().toISOString(),
    };
    mountpoints.push(newMountpoint);
    return newMountpoint;
  }

  if (method === "PUT") {
    // update an existing mountpoint (e.g., when publisher joins)
    const body = await readBody(event);
    const mountpointId = body.id;

    const mountpoint = mountpoints.find((mp) => mp.id === mountpointId);
    if (mountpoint) {
      // Update publisher ID when publisher joins
      if (body.publisherId) mountpoint.publisherId = body.publisherId;
      // Update description if provided
      if (body.description) mountpoint.description = body.description;

      return mountpoint;
    }
    return { error: "Mountpoint not found" };
  }

  if (method === "DELETE") {
    // delete a mountpoint
    const body = await readBody(event);
    const mountpointId = body.id;

    const index = mountpoints.findIndex((mp) => mp.id === mountpointId);

    if (index !== -1) mountpoints.splice(index, 1);
    return { success: true };
  }
});
