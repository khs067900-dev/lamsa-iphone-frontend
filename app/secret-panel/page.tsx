import { cookies } from "next/headers";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";

export const metadata = { robots: "noindex, nofollow" };

export default async function SecretPanelPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sp_token")?.value;
  const secret = process.env.SECRET_PANEL_PASSWORD;
  const isAuthed = token && secret && token === secret;

  return isAuthed ? <Dashboard /> : <LoginForm />;
}
