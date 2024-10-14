import { Hono } from "hono";

import { db } from "@/db/drizzle";
import {
  transactions,
  insertTransactionSchema,
  categories,
  accounts,
} from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";
import { subDays, parse } from "date-fns";
import { bulkTransactionUpdateRequestSchema } from "@/features/transactions/components/bulk-edit-transaction-sheet";

const drizzleDateFormat = "yyyy-MM-dd";

const app = new Hono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);
      const { from, to, accountId } = c.req.valid("query");

      if (auth?.userId == null) {
        return c.json({ error: "Unauthoraized" }, 401);
      }

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);

      const startDate = from
        ? parse(from, drizzleDateFormat, new Date())
        : defaultFrom;

      const endDate = to ? parse(to, drizzleDateFormat, new Date()) : defaultTo;

      const data = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          category: categories.name,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          account: accounts.name,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(accounts.userId, auth.userId),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
          )
        )
        .orderBy(desc(transactions.date));

      return c.json({
        data,
      });
    }
  )
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");

      if (id == null) {
        return c.json({ error: "Missing Id" }, 400);
      }

      if (auth?.userId == null) {
        return c.json({ error: "Unauthoraized" }, 401);
      }

      const [data] = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)));

      if (data == null) {
        return c.json({ error: "Not Found" }, 404);
      }

      return c.json({ data });
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertTransactionSchema.omit({ id: true })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (auth?.userId == null) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .insert(transactions)
        .values({
          id: createId(),
          ...values,
        })
        .returning();

      return c.json({ data });
    }
  )
  .post(
    "/bulk-create",
    clerkMiddleware(),
    zValidator("json", z.array(insertTransactionSchema.omit({ id: true }))),
    async (c) => {
      const auth = getAuth(c);
      const newTransactions = c.req.valid("json");

      if (auth?.userId == null) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .insert(transactions)
        .values(
          newTransactions.map((transaction) => ({
            id: createId(),
            ...transaction,
          }))
        )
        .returning();

      return c.json({ data });
    }
  )
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator("json", z.object({ ids: z.array(z.string()) })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      if (auth?.userId == null) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const transactionsToDelete = db.$with("transactions_to_delete").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(
              inArray(transactions.id, values.ids),
              eq(accounts.userId, auth.userId)
            )
          )
      );

      const data = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          and(
            inArray(
              transactions.id,
              sql`(select id from ${transactionsToDelete})`
            )
          )
        )
        .returning({ id: transactions.id });

      return c.json({ data });
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator("json", insertTransactionSchema.omit({ id: true })),
    async (c) => {
      const auth = getAuth(c);

      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (id == null) {
        return c.json({ error: "Missing Id" }, 400);
      }

      if (auth?.userId == null) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const transactionsToUpdate = db.$with("transaction_to_update").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)))
      );

      const [data] = await db
        .with(transactionsToUpdate)
        .update(transactions)
        .set(values)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToUpdate})`
          )
        )
        .returning();

      if (data == null) {
        return c.json({ error: "Not Found" }, 404);
      }

      return c.json({ data });
    }
  )
  .put(
    "/bulk-edit",
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
        fields: bulkTransactionUpdateRequestSchema,
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");

      const { ids, fields } = values;

      if (auth?.userId == null) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const transactionsToUpdate = db.$with("transaction_to_update").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(inArray(transactions.id, ids), eq(accounts.userId, auth.userId))
          )
      );

      const [data] = await db
        .with(transactionsToUpdate)
        .update(transactions)
        .set(fields)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToUpdate})`
          )
        )
        .returning();

      if (data == null) {
        return c.json({ error: "Server Error" }, 500);
      }

      return c.json({});
    }
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    async (c) => {
      const auth = getAuth(c);

      const { id } = c.req.valid("param");

      if (id == null) {
        return c.json({ error: "Missing Id" }, 400);
      }

      if (auth?.userId == null) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const transactionsToDelete = db.$with("transaction_to_delete").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)))
      );

      const [data] = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToDelete})`
          )
        )
        .returning({ id: transactions.id });

      if (data == null) {
        return c.json({ error: "Not Found" }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
