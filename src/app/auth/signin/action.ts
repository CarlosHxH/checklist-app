"use server";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

async function authenticate(
  provider: { id: string; name: string },
  formData: FormData,
  callbackUrl?: string
) {
  try {
    console.log({formData});
    
    const email = formData.get("email");
    const password = formData.get("password");
    return await signIn(provider.id, {
      email,
      password,
      redirect: true,
      callbackUrl: callbackUrl ?? "/",
    });
  } catch (error) {
    // Handle NEXT_REDIRECT error separately to allow redirects to work
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    // Handle Auth.js errors
    if (error instanceof AuthError) {
      const errorMessage = error.message.split("Read more")[0].trim();
      return {
        error: error.cause || errorMessage,
        type: (error as any).type,
      };
    }

    // Handle any other errors
    return {
      error: "Algo deu errado.",
      type: "UnknownError",
    };
  }
}

export default authenticate;
