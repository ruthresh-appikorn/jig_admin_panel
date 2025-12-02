import { GetAllTestsInputData, getAllTestsInputDataSchema } from './get_all_tests_input_model';
import { getAllTestsOutputDataSchema } from './get_all_tests_output_model';
import { getAllTestsOutputModel } from './get_all_tests_store';

export type GetAllTestsOutputData = import('./get_all_tests_output_model').getAllTestsOutputData;

export async function getAllTestsApi(input: GetAllTestsInputData): Promise<GetAllTestsOutputData> {
  try {
    // Validate input
    const validatedInput = getAllTestsInputDataSchema.parse(input);
    
    // Make API call
    const response = await fetch('https://testjig.online/', {
      method: 'POST',
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ query: `query GetTests {
  getTests {
    COMPONENT {
      COMPONENT_ID
      NAME
      PART_NUMBER
      STATUS
      TIME
      TYPE
      _id
      NOTES
    }
    TESTING_ID
    TESTER_NAME
    DETAILS {
      TEST_NAME
      REMARKS
      DATAS {
        SUB_COMPONENT_SERIAL_NO
        REASON
        QC_STATUS
        INSPECTION
        CRITERIA {
          VALUE
          DESC
        }
      }
    }
    TIME
    COMPONENT_SERIAL_NO
    COMPONENT_ID
    createdAt
    updatedAt
    id
  }
}`, variables: { input: validatedInput } }),
    });
    
    if (!response.ok) {
      let errorPayload = null;
      try {
        errorPayload = await response.json();
      } catch {}

      // You can access errorPayload fields, e.g., errorPayload.respCode
      if (typeof window !== 'undefined') alert(errorPayload || 'API error');
      return {} as GetAllTestsOutputData;
    }
    
    const apiResponse = await response.json();
    
    // Validate output
    const validatedOutput = getAllTestsOutputDataSchema.parse(apiResponse);
    
    // Update store using the update method pattern
    // if (apiResponse.success && apiResponse.got) {
      getAllTestsOutputModel.update({
        getAllTestsData: apiResponse
      });
    // }
    
    return validatedOutput;
    
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'API error';
    if (typeof window !== 'undefined') alert(msg);
    return {} as GetAllTestsOutputData;
  }
}
