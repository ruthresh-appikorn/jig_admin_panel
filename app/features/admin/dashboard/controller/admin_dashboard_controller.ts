import React from "react";
import { adminDashboardFormData, adminDashboardInputModel } from "../store/admin_dashboard_store";

export const handleAdmin_dashboardSubmit = async (
  e: React.FormEvent,
  setErrors: (errors: string[]) => void
) => {
  e.preventDefault();
  const currentData = adminDashboardInputModel.useStore.getState().adminDashboardData;
  
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
};

export const onDestroy = () => {
  console.log("Admin_dashboard page destroyed");
};

export const resetForm = () => {
  adminDashboardInputModel.reset();
  console.log("Form reset completed");
};

export const validateForm = (data: Partial<adminDashboardFormData>): string[] => {
  const errors: string[] = [];

  // Add your validation logic here
  // Example validations (uncomment and modify as needed):
  
  // if (!data.fieldName?.trim()) {
  //   errors.push("Field name is required");
  // }

  

  return errors;
};
