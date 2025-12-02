import { navigate } from "@/core/navigation/simplified_router";
import { LoginInputData, loginInputDataSchema } from "./login_input_model";
import { loginOutputDataSchema } from "./login_output_model";
import { loginOutputModel } from "./login_store";
import { toast } from "@/components/appikorn-components/toast_appi";

export type LoginOutputData = import("./login_output_model").loginOutputData;

export async function loginApi(
  input: LoginInputData
): Promise<LoginOutputData> {
  try {
    // Validate input
    const validatedInput = loginInputDataSchema.parse(input);

    // Make API call
    const response = await fetch("https://testjig.online/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `mutation Login($username: String!, $password: String!) {
  login(USERNAME: $username, PASSWORD: $password) {
    token
    user {
      updatedAt
      id
      createdAt
      USER_ID
      USERNAME
      TIME
    }
  }
}`,
        variables: {
          username: validatedInput.username,
          password: validatedInput.password,
        },
      }),
    });

    if (!response.ok) {
      let errorPayload = null;
      try {
        errorPayload = await response.json();
      } catch {}

      // You can access errorPayload fields, e.g., errorPayload.respCode
      if (typeof window !== "undefined") alert(errorPayload || "API error");
      return {} as LoginOutputData;
    }

    const apiResponse = await response.json();

    // Validate output
    const validatedOutput = loginOutputDataSchema.parse(apiResponse);

    // Update store using the update method pattern
    // if (apiResponse.success && apiResponse.got) {

    toast.success("Login successful");

    loginOutputModel.update({
      loginData: apiResponse,
    });

    navigate("/features/admin/dashboard");

    // }

    return validatedOutput;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "API error";
    if (typeof window !== "undefined") alert(msg);
    return {} as LoginOutputData;
  }
}
