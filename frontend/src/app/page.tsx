import { redirect } from "next/navigation";

// Default landing is the login page only.
export default function Home() {
  redirect("/login");
}
