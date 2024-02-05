import { User } from "next-auth";
import { SignInButton, SignOutButton } from "./auth-buttons";

export default function UserInfo({
  user,
  dark,
}: {
  user: User | undefined;
  dark?: boolean;
}) {
  return (
    <div className="clear-both mr-2 mt-4 lg:mr-4">
      <div className="flex flex-row float-right gap-1 items-center text-sm">
        {user ? (
          <>
            <img
              alt="User avatar"
              className="rounded-full"
              src={user?.image || ""}
              width="32px"
            />
            <p>{user?.name} •</p>
            <SignOutButton />
          </>
        ) : (
          <>
            <p>Not signed in •</p>
            <SignInButton dark={dark} />
          </>
        )}
      </div>
    </div>
  );
}
