import { z } from 'zod';

export const topicSchema = z.string().trim().min(5).max(1200);
export const outcomeSchema = z.string().trim().max(500).optional();
export const countSchema = z.number().int().min(3).max(15).default(10);
