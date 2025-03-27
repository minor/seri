import { auth } from "@clerk/nextjs/server";
import LandingPage from "@/app/components/LandingPage";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return <LandingPage isSignedIn={isSignedIn} />;
}
