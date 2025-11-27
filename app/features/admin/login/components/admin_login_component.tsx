"use client";

import { memo } from "react";
import { adminLoginInputModel } from "../store/admin_login_store";

/**
 * Admin_login Component
 */

export const UserNameField = memo(() => {
  const userName = adminLoginInputModel.useSelector(
    (state) => state.adminLoginData.userName || ""
  );

  console.log("🔥 UserNameField value changed:", userName);

  return <div></div>;
});

export const PasswordField = memo(() => {
  const password = adminLoginInputModel.useSelector(
    (state) => state.adminLoginData.password || ""
  );

  console.log("🔥 PasswordField value changed:", password);

  return (
    <div></div>
  );
});
