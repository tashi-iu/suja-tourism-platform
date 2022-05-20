import {
  Outlet,
  useFetcher,
  useNavigate,
  useTransition
} from "@remix-run/react";
import {
  BiBell,
  BiCalendarEvent,
  BiChat,
  BiChevronDown,
  BiCog,
  BiGroup,
  BiHomeCircle,
  BiSearchAlt2,
  BiUser
} from "react-icons/bi";
import { FaGoogle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { MdTour } from "react-icons/md";
import ProviderSignInButton from "~/components/auth/ProviderSignInButton";
import Avatar from "~/components/ui-kit/Avatar";
import DropdownMenu from "~/components/ui-kit/DropdownMenu";
import NavBar from "~/components/ui-kit/NavBar";
import SearchInput from "~/components/ui-kit/SearchInput";
import { useOptionalProfile, useOptionalUser } from "~/utils";

export default function SocialLayout() {
  const transition = useTransition();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const user = useOptionalUser();

  const profile = useOptionalProfile();
  const hasUser = user?.role === "authenticated";

  const notifications: any[] = [];
  const friends: any[] = [];

  return (
    <div className="flex w-full">
      <div className="hidden md:block md:w-1/4">
        <div className="flex flex-col gap-y-4 p-4">
          <div>
            <img src="assets/images/logo.png" alt="Suja" className="w-28" />
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
                        <Avatar src="" alt="Profile picture" size={28} />
                        <p className="flex-1 text-ellipsis text-slate-700/80">
                          Some friend
                        </p>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                    </div>
                  ))
                ) : (
                  <p>You have no conversations at the moment.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col">
          <div className="flex flex-none justify-center align-top">
            <NavBar
              isAuthenticated={hasUser}
              fetcher={fetcher}
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
                  key: "business",
                  name: "Business",
                  to: "/business",
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
                  name: "My Profile",
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
            {transition.state === "loading" ? <div>Loading</div> : <Outlet />}
          </div>
        </div>
      </div>
      <div className="hidden md:block md:w-1/4">
        <div className="flex w-full flex-col gap-4 p-4">
          {hasUser ? (
            <div className="flex items-center justify-between">
              <div className="relative">
                {notifications.length ? (
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-emerald-500" />
                ) : null}
                <button className="rounded-full p-2 hover:bg-slate-500/10">
                  <BiBell size="18" className="text-slate-500/80" />
                </button>
              </div>
              <DropdownMenu
                items={[
                  {
                    key: "my-profile",
                    icon: BiUser,
                    onClick: () => {
                      navigate(`/u/${profile?.id}`);
                    },
                    label: "My Profile",
                  },
                  {
                    key: "logout",
                    icon: FiLogOut,
                    onClick: () => {
                      fetcher.submit(null, {
                        action: "/api/sign-out",
                        method: "post",
                        replace: true,
                      });
                    },
                    label: "Log Out",
                  },
                ]}
              >
                <Avatar
                  src={profile?.avatar_url ?? ""}
                  alt="Profile"
                  size={28}
                />
                <p className="text-white/80">{profile?.name}</p>
                <BiChevronDown size="18" className="text-white/80" />
              </DropdownMenu>
            </div>
          ) : (
            <ProviderSignInButton provider="google">
              <FaGoogle className="h-4 w-4" />
              <div className="leading-none">Sign in with Google</div>
            </ProviderSignInButton>
          )}
        </div>
      </div>
    </div>
  );
}
