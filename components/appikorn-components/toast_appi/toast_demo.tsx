// ToastDemo.tsx - Example usage component
import React from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useToast } from "./use_toast";

export const ToastDemo: React.FC = () => {
  const toast = useToast();

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <h3 className="text-lg font-semibold">Toast Demo</h3>
      </CardHeader>
      <CardBody className="space-y-3">
        <Button
          color="success"
          variant="flat"
          onPress={() => toast.success("Operation completed successfully!")}
          className="w-full"
        >
          Show Success Toast
        </Button>
        
        <Button
          color="danger"
          variant="flat"
          onPress={() => toast.error("Something went wrong. Please try again.")}
          className="w-full"
        >
          Show Error Toast
        </Button>
        
        <Button
          color="warning"
          variant="flat"
          onPress={() => toast.warning("Please check your input before proceeding.")}
          className="w-full"
        >
          Show Warning Toast
        </Button>
        
        <Button
          color="primary"
          variant="flat"
          onPress={() => toast.info("Here's some helpful information for you.")}
          className="w-full"
        >
          Show Info Toast
        </Button>
        
        <Button
          color="default"
          variant="flat"
          onPress={() => toast.custom({
            message: "This is a custom toast with no auto-dismiss!",
            level: "success",
            duration: 0, // Won't auto-dismiss
            size: "lg"
          })}
          className="w-full"
        >
          Show Custom Toast
        </Button>
        
        <Button
          color="default"
          variant="bordered"
          onPress={() => toast.clearAllToasts()}
          className="w-full"
        >
          Clear All Toasts
        </Button>
      </CardBody>
    </Card>
  );
};

export default ToastDemo;
