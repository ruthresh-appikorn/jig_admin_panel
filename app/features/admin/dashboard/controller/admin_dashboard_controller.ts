import React from "react";
import {
  adminDashboardFormData,
  adminDashboardInputModel,
} from "../store/admin_dashboard_store";
import { getAllTestsApi } from "../api/get_all_tests/get_all_tests_api";
import { getAllTestsInputDataSchema } from "../api/get_all_tests/get_all_tests_input_model";

export const callGetAllTestsApi = async () => {
  // Create API request using the input model with empty strings
  const apiRequest = getAllTestsInputDataSchema.parse({});
  // Retrieve screen-specific input data dynamically based on controller/screen name
  const data = adminDashboardInputModel.useStore.getState().adminDashboardData;
  console.log("Calling getAllTestsApi with request:", apiRequest);
  try {
    // Call the API and get the response
    await getAllTestsApi(apiRequest);

    return true;
  } catch (error) {
    console.error("getAllTestsApi call failed:", error);
    return false;
  }
};

export const handleAdmin_dashboardSubmit = async (
  e: React.FormEvent,
  setErrors: (errors: string[]) => void
) => {
  e.preventDefault();
  const currentData =
    adminDashboardInputModel.useStore.getState().adminDashboardData;

  // Validate before submission
  const validationErrors = validateForm(currentData);
  if (validationErrors.length > 0) {
    setErrors(validationErrors);
    return;
  }

  setErrors([]);
  try {
    // Log the data for testing purposes
    // console.log("Admin_dashboard Data Submitted:", currentData);

    alert("Admin_dashboard data saved successfully!");
  } catch (error) {
    setErrors([error instanceof Error ? error.message : "Submission failed"]);
  }
};

export const onInit = () => {
  console.log("Admin_dashboard page initialized");
  callGetAllTestsApi();
  // Set dummy data for stats
  adminDashboardInputModel.update({
    adminDashboardData: {
      passedLogs: 7,
      failedLogs: 3,
      totalLogs: 10,
    },
  });
};

export const onDestroy = () => {
  console.log("Admin_dashboard page destroyed");
};

export const resetForm = () => {
  adminDashboardInputModel.reset();
  console.log("Form reset completed");
};

export const validateForm = (
  data: Partial<adminDashboardFormData>
): string[] => {
  const errors: string[] = [];

  // Add your validation logic here
  // Example validations (uncomment and modify as needed):

  // if (!data.fieldName?.trim()) {
  //   errors.push("Field name is required");
  // }

  return errors;
};
