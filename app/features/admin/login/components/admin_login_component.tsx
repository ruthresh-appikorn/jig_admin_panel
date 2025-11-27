"use client";

import { memo, useState } from "react";
import { adminLoginInputModel } from "../store/admin_login_store";
import { InputAppi } from "@/components/appikorn-components/input_appi/input_appi";
import { Eye, EyeOff } from "lucide-react";
import { ButtonAppi } from "@/components/appikorn-components/button_appi/button_appi";

/**
 * Admin_login Component
 */

export const UserNameField = memo(() => {
  const userName = adminLoginInputModel.useSelector(
    (state) => state.adminLoginData.userName || ""
  );

  console.log("🔥 UserNameField value changed:", userName);

  return (
    <div className="w-full">
      <InputAppi
        className="w-full"
        defaultValue={userName}
        isRequired={true}
        label="User ID"
        labelPlacement="inside"
        size="lg"
        variant="flat"
        classNames={{
          label: "text-sm font-semibold text-slate-200 mb-1",
          inputWrapper:
            "h-14 rounded-xl !border-none !outline-none border border-white/20 !bg-white/5 transition data-[hover=true]:border-white/40 data-[focus=true]:border-purple-400",
          input: "text-sm  text-white placeholder:text-slate-400",
        }}
        placeholder="Enter User ID"
        onComplete={(value: string) => {
          adminLoginInputModel.update({
            adminLoginData: { userName: value },
          });
        }}
      />
    </div>
  );
});

export const PasswordField = memo(() => {
  const password = adminLoginInputModel.useSelector(
    (state) => state.adminLoginData.password || ""
  );

  const [isVisible, setIsVisible] = useState(false);

  console.log("🔥 PasswordField value changed:", password);

  return (
    <div className="w-full">
      <InputAppi
        className="w-full"
        defaultValue={password}
        endContent={
          <button
            className="focus:outline-none text-default-500 hover:text-default-700 dark:text-default-400 dark:hover:text-default-300"
            type="button"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
        isRequired={true}
        label="Password"
        labelPlacement="inside"
        size="lg"
        variant="flat"
        classNames={{
          label: "text-sm font-semibold text-slate-200 mb-1",
          inputWrapper:
  "h-14 rounded-xl !border-none !outline-none border border-white/20 !bg-white/5 transition data-[hover=true]:border-white/40 data-[focus=true]:border-purple-400",
          input: "text-sm  text-white placeholder:text-slate-400",
        }}
        placeholder="Enter Password"
        type="text"
        style={{
          WebkitTextSecurity: isVisible ? "none" : "disc",
        }}
        onComplete={(value: string) => {
          adminLoginInputModel.update({
            adminLoginData: { password: value },
          });
        }}
      />
    </div>
  );
});

export const SubmitField = memo(() => {
  const submit = adminLoginInputModel.useSelector(
    (state) => state.adminLoginData.submit || ""
  );

  const userName = adminLoginInputModel.useSelector(
    (state) => state.adminLoginData.userName || ""
  );
  const password = adminLoginInputModel.useSelector(
    (state) => state.adminLoginData.password || ""
  );

  console.log("🔥 SubmitField value changed:", submit);

  return (
    <ButtonAppi
      className="w-full mt-2 h-[46px]"
      // isLoading= {true}
      isLoading={adminLoginInputModel.useSelector(
        (state) => state.adminLoginData.loading
      )}
      spinner={
        <div className="h-6 w-6 rounded-full border-3 border-white border-t-transparent animate-spin" />
      }
      isDisabled={!userName || !password}
      type="submit"
    >
      Login
    </ButtonAppi>
  );
});
