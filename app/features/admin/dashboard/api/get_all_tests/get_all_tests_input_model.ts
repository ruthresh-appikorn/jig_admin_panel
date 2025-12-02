import { z } from 'zod';

const GetAllTestsInputDataSchema = z.object({

});

export const getAllTestsInputDataSchema = GetAllTestsInputDataSchema;
export type GetAllTestsInputData = z.infer<typeof getAllTestsInputDataSchema>;
