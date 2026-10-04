"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function login(_prev: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Invalid password";
    }
    throw error;
  }
}
