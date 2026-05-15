/**
 * mobile/app/index.tsx
 * Entry point — immediately redirects to the auth flow.
 */

import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
