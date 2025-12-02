"use client";

import { useEffect, useState } from "react";
import { Form } from "@heroui/form";
import { adminLoginInputModel } from "./store/admin_login_store";
import {
  handleAdmin_loginSubmit,
  onInit,
  onDestroy,
  resetForm,
  validateForm,
} from "./controller/admin_login_controller";
import { motion } from "framer-motion";
import { Building2, Shield, Users } from "lucide-react";
import { Card, CardBody, Divider } from "@heroui/react";
import {
  PasswordField,
  SubmitField,
  UserNameField,
} from "./components/admin_login_component";

export const dynamic = "force-dynamic";

export default function Admin_loginPage() {
  const [errors, setErrors] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Initialize page on mount
  useEffect(() => {
    setIsClient(true);
    onInit();
    return () => {
      onDestroy();
    };
  }, []);

  // Don't render anything until client-side to avoid hydration issues
  if (!isClient) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-950 via-slate-950 to-purple-950 text-white">
      {/* Animated background accents */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-600/40 to-purple-600/40 blur-3xl"
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        animate={{
          scale: [1.1, 0.9, 1.1],
          opacity: [0.3, 0.6, 0.3],
        }}
        className="absolute -bottom-48 right-[-120px] h-[480px] w-[480px] rounded-full bg-gradient-to-br from-purple-500/30 to-pink-600/40 blur-3xl"
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-2 sm:px-4 py-16">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-center"
          initial={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Card className="w-full max-w-lg border border-white/10 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-purple-900/30">
            <CardBody className="p-2 sm:p-4 md:p-8 space-y-4 md:space-y-6">
              <div className="text-center">
                {/* <div className="mb-4 flex justify-center">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-purple-600 to-pink-600"
                    transition={{ duration: 6, repeat: Infinity }}
                  >
                    <span className="text-xl font-bold text-white">A</span>
                  </motion.div>
                </div> */}
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
                  Welcome Back
                </h2>
                <p className="mt-2 text-sm sm:text-sm text-gray-300">
                  Sign in to orchestrate your enterprise with Appikorn
                </p>
              </div>

              <Form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log(
                    "Form submitted - calling handleAdmin_loginSubmit"
                  );
                  handleAdmin_loginSubmit(e, setErrors);
                }}
              >
                {errors.length > 0 && (
                  <div className="w-full rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
                    <div className="space-y-1 text-left text-sm text-red-200">
                      {errors.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </div>
                  </div>
                )}

                <UserNameField />
                <PasswordField />
                <SubmitField />
              </Form>

              {/* <Divider className="my-2 sm:my-6 border-white/10" /> */}

              <div className="text-center text-gray-400">
                <p className="text-sm">
                  Need help? Contact your system administrator
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {/* Version {appVersion} */}
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
