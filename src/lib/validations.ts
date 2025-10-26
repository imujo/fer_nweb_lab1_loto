import { z } from "zod";

export const storeResultsSchema = z.object({
  numbers: z
    .array(z.number().int().min(1).max(45))
    .min(6)
    .max(10)
    .refine(
      (numbers) => new Set(numbers).size === numbers.length,
      "Numbers must be unique"
    ),
});

export const personalIdSchema = z
  .string()
  .min(1, "Personal ID is required")
  .max(20, "Personal ID must be 20 characters or less");

export const createTicketSchema = z.object({
  personalId: personalIdSchema,
  roundId: z.number().int().positive(),
  numbers: z
    .array(z.number().int().min(1).max(45))
    .min(6)
    .max(10)
    .refine(
      (numbers) => new Set(numbers).size === numbers.length,
      "Numbers must be unique"
    ),
});

export const roundIdSchema = z.number().int().positive();

export const ticketIdSchema = z.string().uuid();

export const auth0IdSchema = z.string().min(1);

export const userSchema = z.object({
  auth0Id: auth0IdSchema,
  email: z.string().email(),
  name: z.string().optional(),
});

export type StoreResultsInput = z.infer<typeof storeResultsSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UserInput = z.infer<typeof userSchema>;
