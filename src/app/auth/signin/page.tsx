import * as React from "react";
import { SignInPage } from "@toolpad/core/SignInPage";
import authenticate from "./action";

export default function SignIn() {
  return <SignInPage providers={[{id:'credentials',name:'Credentials'}]} signIn={authenticate} />;
}
