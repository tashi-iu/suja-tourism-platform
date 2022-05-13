import { Outlet } from "@remix-run/react";
import {
  BiCalendarEvent,
  BiChat,
  BiCog,
  BiGroup,
  BiHomeCircle,
  BiSearchAlt2,
  BiUser
} from "react-icons/bi";
import { FaGoogle } from "react-icons/fa";
import { MdTour } from "react-icons/md";
import { VscBell } from "react-icons/vsc";
import NavBar from "~/components/NavBar";
import ProviderSignInButton from "~/components/ProviderSignInButton";
import Avatar from "~/components/ui/Avatar";
import SearchInput from "~/components/ui/SearchInput";
import { useOptionalUser } from "~/utils";

export default function SocialLayout() {
  const user = useOptionalUser();
  const notifications: any[] = [];
  const friends: any[] = [];
  const hasUser = !!user?.id;
  return (
    <div className="flex">
      <div className="invisible flex h-screen w-1/5 flex-col gap-y-4 bg-slate-200/50 p-4 md:visible">
        <div>
          <img src="assets/images/logo.png" alt="Suja" className="w-32" />
        </div>
        <SearchInput placeholder="Search" />
        {hasUser ? (
          <div className="mt-4">
            <div>
              {friends.length ? (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between gap-x-2"
                  >
                    <div className="flex gap-x-2">
                      <Avatar src="" alt="Profile picture" size={18} />
                      <p className="flex-1 text-ellipsis text-slate-700/80">
                        Some friend
                      </p>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                  </div>
                ))
              ) : (
                <p>Add a friend.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col">
          <div className="flex flex-none justify-center align-top">
            <NavBar
              items={[
                {
                  icon: BiHomeCircle,
                  key: "home",
                  name: "Home",
                  to: "/",
                },
                {
                  icon: BiChat,
                  key: "chat",
                  name: "Chat",
                  to: "/chat",
                  hidden: !hasUser,
                },
                {
                  icon: BiSearchAlt2,
                  key: "search",
                  name: "Search",
                  to: "/search",
                },
                {
                  icon: BiGroup,
                  key: "groups",
                  name: "Groups",
                  to: "/groups",
                },
                {
                  icon: MdTour,
                  key: "tours",
                  name: "Tours",
                  to: "/tours",
                },
                {
                  icon: BiCalendarEvent,
                  key: "plans",
                  name: "Plans",
                  to: "/plans",
                  hidden: !hasUser,
                },
                {
                  icon: BiUser,
                  key: "profile",
                  name: "Your Profile",
                  to: `/u/${user?.id}`,
                  hidden: !hasUser,
                },
                {
                  icon: BiCog,
                  key: "settings",
                  name: "Settings",
                  to: "/settings",
                  hidden: !hasUser,
                },
              ]}
            />
          </div>
          <div>
            <Outlet />
          </div>
        </div>
      </div>
      <div className="invisible flex h-screen w-1/5 flex-col gap-4 bg-slate-200/50 p-4 md:visible">
        {hasUser ? (
          <div className="flex justify-end">
            <div className="relative">
              {notifications.length ? (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-emerald-500" />
              ) : null}
              <VscBell size="18" className="text-slate-500/80" />
            </div>
            <div className="flex justify-end">
              <p>{user?.user_metadata.full_name}</p>
            </div>
          </div>
        ) : (
          <ProviderSignInButton provider="google">
            <FaGoogle className="h-4 w-4" />
            <div className="leading-none">Sign in with Google</div>
          </ProviderSignInButton>
        )}
      </div>
    </div>
  );
}
