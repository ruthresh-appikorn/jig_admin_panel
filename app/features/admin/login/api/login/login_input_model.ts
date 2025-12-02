import { z } from 'zod';

const LoginInputDataSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional()
});

export const loginInputDataSchema = LoginInputDataSchema;
export type LoginInputData = z.infer<typeof loginInputDataSchema>;
