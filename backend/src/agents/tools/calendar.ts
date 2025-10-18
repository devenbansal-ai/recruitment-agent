const FAKE_EVENTS = [
  { id: "1", title: "Team sync", date: "2025-10-01" },
  { id: "2", title: "Interview", date: "2025-10-07" },
];

export async function read({ range }: { range?: string }) {
  return { range, events: FAKE_EVENTS };
}

export async function write({ event, confirmed }: { event: any; confirmed?: boolean }) {
  if (!confirmed) throw new Error("Write not confirmed");
  FAKE_EVENTS.push({ id: String(FAKE_EVENTS.length + 1), ...event });
  return { ok: true, event };
}
