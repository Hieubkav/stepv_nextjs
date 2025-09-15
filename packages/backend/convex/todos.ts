import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
	handler: async (ctx) => {
		return await ctx.db.query("todos").collect();
	},
});

export const create = mutation({
	args: {
		text: v.string(),
	},
	handler: async (ctx, args) => {
		const newTodoId = await ctx.db.insert("todos", {
			text: args.text,
			completed: false,
		});
		return await ctx.db.get(newTodoId);
	},
});

export const toggle = mutation({
	args: {
		id: v.id("todos"),
		completed: v.boolean(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, { completed: args.completed });
		return { success: true };
	},
});

export const deleteTodo = mutation({
	args: {
		id: v.id("todos"),
	},
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
		return { success: true };
	},
});

export const updateText = mutation({
  args: {
    id: v.id("todos"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { text: args.text });
    return { success: true };
  },
});

export const list = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.union(v.literal("all"), v.literal("active"), v.literal("completed"))),
    offset: v.number(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const { search, status = "all", offset, limit } = args;
    let items = await ctx.db.query("todos").collect();

    // Filter by status
    if (status === "active") items = items.filter((t) => !t.completed);
    if (status === "completed") items = items.filter((t) => t.completed);

    // Text search (naive; fine for small datasets)
    if (search && search.trim().length > 0) {
      const s = search.trim().toLowerCase();
      items = items.filter((t) => t.text.toLowerCase().includes(s));
    }

    // Sort by creation time desc
    items.sort((a, b) => b._creationTime - a._creationTime);

    const total = items.length;
    const page = items.slice(offset, offset + limit);
    return { items: page, total };
  },
});

export const getById = query({
  args: { id: v.id("todos") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const bulkToggle = mutation({
  args: { ids: v.array(v.id("todos")), completed: v.boolean() },
  handler: async (ctx, { ids, completed }) => {
    for (const id of ids) {
      await ctx.db.patch(id, { completed });
    }
    return { success: true, count: ids.length };
  },
});

export const bulkDelete = mutation({
  args: { ids: v.array(v.id("todos")) },
  handler: async (ctx, { ids }) => {
    for (const id of ids) {
      await ctx.db.delete(id);
    }
    return { success: true, count: ids.length };
  },
});
