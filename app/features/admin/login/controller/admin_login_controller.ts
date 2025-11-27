import React from "react";
import {
  adminLoginFormData,
  adminLoginInputModel,
} from "../store/admin_login_store";
import { navigate } from "@/core/navigation/simplified_router";

export const handleAdmin_loginSubmit = async (
  e: React.FormEvent,
  setErrors: (errors: string[]) => void
) => {
  e.preventDefault();
  const currentData = adminLoginInputModel.useStore.getState().adminLoginData;

  // Validate before submission
  const validationErrors = validateForm(currentData);
  if (validationErrors.length > 0) {
    setErrors(validationErrors);
    return;
  }

  setErrors([]);
  try {
    // Log the data for testing purposes
    // console.log("Admin_login Data Submitted:", currentData);

    navigate("/features/admin/dashboard");

    // alert("Admin_login data saved successfully!");
  } catch (error) {
    setErrors([error instanceof Error ? error.message : "Submission failed"]);
  }
};

export const onInit = () => {
  console.log("Admin_login page initialized");
};

export const onDestroy = () => {
  console.log("Admin_login page destroyed");
};

export const resetForm = () => {
  adminLoginInputModel.reset();
  console.log("Form reset completed");
};

export const validateForm = (data: Partial<adminLoginFormData>): string[] => {
  const errors: string[] = [];

  // Add your validation logic here
  // Example validations (uncomment and modify as needed):

  // if (!data.fieldName?.trim()) {
  //   errors.push("Field name is required");
  // }

  return errors;
};
