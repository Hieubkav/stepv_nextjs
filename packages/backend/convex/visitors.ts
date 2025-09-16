import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const INACTIVITY_WINDOW_MS = 5 * 60 * 1000;

type RangeValue = "today" | "month" | "year" | "all";

type StatsTimelinePoint = {
  label: string;
  from: number;
  to: number;
  visits: number;
};

export const track = mutation({
  args: {
    sessionId: v.string(),
    visitorId: v.string(),
    path: v.string(),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    eventType: v.optional(v.union(v.literal("page_view"), v.literal("heartbeat"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const eventType = args.eventType ?? "page_view";

    const existingSession = await ctx.db
      .query("visitor_sessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!existingSession) {
      await ctx.db.insert("visitor_sessions", {
        visitorId: args.visitorId,
        sessionId: args.sessionId,
        userAgent: args.userAgent,
        firstSeen: now,
        lastSeen: now,
        pageCount: eventType === "page_view" ? 1 : 0,
        order: now,
        active: true,
      });
    } else {
      const patch: Record<string, any> = {
        lastSeen: now,
        active: true,
      };
      if (!existingSession.userAgent && args.userAgent) {
        patch.userAgent = args.userAgent;
      }
      if (eventType === "page_view") {
        patch.pageCount = (existingSession.pageCount ?? 0) + 1;
      }
      await ctx.db.patch(existingSession._id, patch as any);
    }

    if (eventType === "page_view") {
      await ctx.db.insert("visitor_events", {
        sessionId: args.sessionId,
        visitorId: args.visitorId,
        path: args.path,
        referrer: args.referrer,
        occurredAt: now,
        eventType,
        order: now,
        active: true,
      });
    }

    const staleThreshold = now - INACTIVITY_WINDOW_MS;
    const staleSessions = await ctx.db
      .query("visitor_sessions")
      .withIndex("by_lastSeen", (q) => q.lt("lastSeen", staleThreshold))
      .take(100);

    for (const stale of staleSessions) {
      if (stale.active) {
        await ctx.db.patch(stale._id, { active: false } as any);
      }
    }

    return { ok: true };
  },
});

export const stats = query({
  args: {
    range: v.union(
      v.literal("today"),
      v.literal("month"),
      v.literal("year"),
      v.literal("all"),
    ),
  },
  handler: async (ctx, { range }) => {
    const now = Date.now();
    const { start } = rangeToWindow(range, now);

    const eventsQuery = ctx.db
      .query("visitor_events")
      .withIndex("by_occurred", (q) => (start !== null ? q.gte("occurredAt", start) : q));

    const events = await eventsQuery.collect();
    const relevantEvents = events.filter(
      (event) => event.occurredAt <= now && event.active !== false,
    );

    const totalVisits = relevantEvents.length;
    const uniqueVisitors = new Set(relevantEvents.map((event) => event.visitorId)).size;
    const uniqueSessions = new Set(relevantEvents.map((event) => event.sessionId)).size;

    const activeThreshold = now - INACTIVITY_WINDOW_MS;
    const activeSessions = await ctx.db
      .query("visitor_sessions")
      .withIndex("by_lastSeen", (q) => q.gt("lastSeen", activeThreshold))
      .collect();
    const activeNow = activeSessions.filter((session) => session.lastSeen >= activeThreshold).length;

    const timeline = buildTimeline(relevantEvents, range, now, start ?? startOfDay(new Date(now)));

    return {
      range,
      totalVisits,
      uniqueVisitors,
      uniqueSessions,
      activeNow,
      start,
      end: now,
      timeline,
    };
  },
});

function rangeToWindow(range: RangeValue, now: number): { start: number | null } {
  const current = new Date(now);
  if (range === "today") {
    return { start: startOfDay(current) };
  }
  if (range === "month") {
    return { start: startOfMonth(current) };
  }
  if (range === "year") {
    return { start: startOfYear(current) };
  }
  return { start: null };
}

function buildTimeline(
  events: { occurredAt: number }[],
  range: RangeValue,
  now: number,
  start: number,
): StatsTimelinePoint[] {
  if (events.length === 0) return [];

  if (range === "today") {
    const base = startOfDay(new Date(now));
    return Array.from({ length: 24 }).map((_, hour) => {
      const from = base + hour * 60 * 60 * 1000;
      const to = from + 60 * 60 * 1000;
      const visits = events.filter((event) => event.occurredAt >= from && event.occurredAt < to).length;
      return {
        label: `${String(hour).padStart(2, "0")}h`,
        from,
        to,
        visits,
      };
    });
  }

  if (range === "month") {
    const current = new Date(now);
    const year = current.getFullYear();
    const month = current.getMonth();
    const days = daysInMonth(year, month);
    return Array.from({ length: days }).map((_, index) => {
      const day = index + 1;
      const from = new Date(year, month, day).getTime();
      const to = new Date(year, month, day + 1).getTime();
      const visits = events.filter((event) => event.occurredAt >= from && event.occurredAt < to).length;
      return {
        label: `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}`,
        from,
        to,
        visits,
      };
    });
  }

  if (range === "year") {
    const current = new Date(now);
    const year = current.getFullYear();
    return Array.from({ length: current.getMonth() + 1 }).map((_, index) => {
      const from = new Date(year, index, 1).getTime();
      const to = new Date(year, index + 1, 1).getTime();
      const visits = events.filter((event) => event.occurredAt >= from && event.occurredAt < to).length;
      return {
        label: `${String(index + 1).padStart(2, "0")}/${year}`,
        from,
        to,
        visits,
      };
    });
  }

  const grouped = new Map<string, { label: string; from: number; to: number; visits: number }>();
  for (const event of events) {
    const date = new Date(event.occurredAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const label = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
    const from = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
    const to = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, { label, from, to, visits: 1 });
    } else {
      existing.visits += 1;
    }
  }

  return Array.from(grouped.values())
    .sort((a, b) => a.from - b.from)
    .slice(-12)
    .map((value) => ({
      label: value.label,
      from: value.from,
      to: value.to,
      visits: value.visits,
    }));
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1).getTime();
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}