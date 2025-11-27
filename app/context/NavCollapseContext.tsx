"use client";
import { createContext, useContext } from "react";

export const NavCollapseContext = createContext<boolean>(false);
export const useNavCollapse = () => useContext(NavCollapseContext);