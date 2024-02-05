import { User } from "next-auth";
import { SignOutButton } from "./auth-buttons";

export default function UserInfo({ user }: { user: User | undefined }) {
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
            <div className="h-8" />
          </>
        )}
      </div>
    </div>
  );
}
