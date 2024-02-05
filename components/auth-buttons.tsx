import { signIn, signOut } from "@/auth";
import { Button } from "./ui/button";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
      className="mx-auto shadow-blocks-tiny border-2 border-slate-400 shadow-slate-300"
    >
      <Button
        type="submit"
        variant="auth"
        className="shadow-none border-none rounded-none h-6"
      >
        Sign out
      </Button>
    </form>
  );
}

export function SignInButton({ dark }: { dark?: boolean }) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("discord");
      }}
      className={`mx-auto shadow-blocks-tiny ${
        dark
          ? "shadow-discord-light"
          : "shadow-discord-deselected border-2 border-black bg-discord-light hover:bg-discord-vibrant"
      }`}
    >
      <Button
        className={`${
          dark
            ? "bg-discord-vibrant hover:bg-discord-light hover:text-black"
            : "bg-discord-light hover:bg-discord-vibrant"
        } shadow-none border-none rounded-none h-6`}
        variant="auth"
        type="submit"
      >
        Sign in with Discord
      </Button>
    </form>
  );
}
