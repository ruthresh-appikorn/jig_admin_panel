"use client";

import { useEffect, useState } from "react";
import { Form } from "@heroui/form";
import { adminDashboardInputModel } from "./store/admin_dashboard_store";
import {
  handleAdmin_dashboardSubmit,
  onInit,
  onDestroy,
  resetForm,
  validateForm
} from "./controller/admin_dashboard_controller";

export default function Admin_dashboardPage() {
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize page on mount
  useEffect(() => {
    onInit();
    return () => {
      onDestroy();
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Form className="space-y-4" onSubmit={(e) => handleAdmin_dashboardSubmit(e, setErrors)}>
          {errors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <button type="submit">Submit</button>
            <button type="button" onClick={() => { resetForm(); }}>Reset</button>
          </div>
        </Form>
      </div>
    </div>
  );
}
