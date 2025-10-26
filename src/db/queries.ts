import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { db, draws, rounds, tickets, users } from "./index";
import { createTicketSchema } from "@/lib/validations";
import z from "zod";

export const getCurrentRound = createServerFn().handler(async () => {
  const currentRound = await db
    .select()
    .from(rounds)
    .orderBy(desc(rounds.id))
    .limit(1);

  return currentRound[0] || null;
});

export const createNewRound = createServerOnlyFn(async () => {
  const lastRound = await getCurrentRound();

  if (lastRound?.isActive) {
    return null;
  }

  const roundNumber = lastRound ? lastRound.roundNumber + 1 : 1;

  const newRound = await db
    .insert(rounds)
    .values({
      roundNumber,
      isActive: true,
    })
    .returning();

  return newRound[0];
});

export const closeCurrentRound = createServerOnlyFn(async () => {
  const currentRound = await getCurrentRound();
  if (!currentRound || !currentRound.isActive) {
    return null;
  }

  const closedRound = await db
    .update(rounds)
    .set({
      isActive: false,
      closedAt: new Date(),
    })
    .where(eq(rounds.id, currentRound.id))
    .returning();

  return closedRound[0];
});

export const createTicket = createServerFn()
  .inputValidator(createTicketSchema)
  .handler(async ({ data: { personalId, numbers, roundId } }) => {
    const ticket = await db
      .insert(tickets)
      .values({
        roundId,
        personalId,
        numbers: JSON.stringify(numbers),
      })
      .returning();

    return ticket[0];
  });

export const getTicketById = createServerOnlyFn(async (ticketId: string) => {
  const ticket = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, ticketId))
    .limit(1);

  return ticket[0] || null;
});

export const getTicketsByRound = createServerOnlyFn(async (roundId: number) => {
  const ticketsList = await db
    .select()
    .from(tickets)
    .where(eq(tickets.roundId, roundId));

  return ticketsList;
});

export const storeDrawResults = createServerOnlyFn(
  async (roundId: number, numbers: number[]) => {
    const draw = await db
      .insert(draws)
      .values({
        roundId,
        numbers: JSON.stringify(numbers),
      })
      .returning();

    return draw[0];
  }
);

export const getDrawResults = createServerFn()
  .inputValidator(z.object({ roundId: z.number() }))
  .handler(async ({ data: { roundId } }) => {
    const draw = await db
      .select()
      .from(draws)
      .where(eq(draws.roundId, roundId))
      .limit(1);

    return draw[0] || null;
  });

export const createOrUpdateUser = createServerOnlyFn(
  async (auth0Id: string, email: string, name?: string) => {
    const user = await db
      .insert(users)
      .values({
        id: auth0Id,
        email,
        name,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email,
          name,
          lastLogin: new Date(),
        },
      })
      .returning();

    return user[0];
  }
);

export const getUserById = createServerOnlyFn(async (auth0Id: string) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, auth0Id))
    .limit(1);

  return user[0] || null;
});
