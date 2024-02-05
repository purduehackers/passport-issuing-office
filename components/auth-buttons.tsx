import { signIn, signOut } from "@/auth";
import { Button } from "./ui/button";
import { cva, type VariantProps } from "class-variance-authority";

const signInButtonVariants = cva(
  {
    variants: {
      variant: {
        default: "bg-amber-500 hover:bg-amber-500/90 text-primary-foreground border-2 shadow-blocks-sm",
        dark: 'border-slate-'
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-sm px-3",
        lg: "h-11 rounded-sm px-8",
        icon: "h-10 w-10",
        auth: 'h-4 rounded-sm'
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface SignInButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof signInButtonVariants> {
  asChild?: boolean
}

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut("discord");
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
      className={`mx-auto shadow-blocks-tiny ${dark ? 'shadow-discord-light' : 'shadow-discord-deselected'}`}
    >
      <Button
        className={`${dark ? 'bg-discord-vibrant hover:bg-discord-light hover:text-black' : 'bg-discord-light hover:bg-discord-vibrant'} shadow-none border-none rounded-none h-6`}
        variant="auth"
        type="submit"
      >
        Sign in with Discord
      </Button>
    </form>
  );
}
