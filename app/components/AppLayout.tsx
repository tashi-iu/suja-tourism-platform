import { Outlet, useTransition } from "@remix-run/react";
import { Link, NavLink } from "@remix-run/react";
import { useOptionalUser } from "~/utils";
import { BiSearch, BiHome, BiPencil } from "react-icons/bi";
import { FaGoogle } from "react-icons/fa";
import { RiArrowDropDownLine } from "react-icons/ri";
import { createElement } from "react";
import ProviderSignInButton from "./ProviderSignInButton";

export default function AppLayout() {
  const transition = useTransition();
  const user = useOptionalUser();

  return (
    <>
      <nav className="z-2 sticky top-0 w-full border-b border-stone-400/30 bg-white/30 backdrop-blur-lg">
        <div className="mx-auto flex max-w-screen-2xl justify-between px-4 py-2">
          <Link to="/" className="flex flex-none items-center">
            <img
              src="/assets/images/logo.png"
              alt="Logo of Suja"
              className="w-24 flex-none md:w-28"
            />
          </Link>
          <div className="flex items-stretch justify-end gap-x-4">
            {user ? (
              <button className="flex items-center justify-between gap-x-2 rounded-full border border-stone-500/30 py-1 pl-1.5 pr-2">
                <img
                  src={user.user_metadata?.avatar_url}
                  className="h-10 w-10 rounded-full"
                  alt="Profile"
                />
                <p>{user.user_metadata?.name}</p>
                <RiArrowDropDownLine size={32} className="text-stone-500/80" />
              </button>
            ) : (
              <ProviderSignInButton provider="google">
                <FaGoogle className="h-4 w-4" />
                <div className="leading-none">Sign in with Google</div>
              </ProviderSignInButton>
            )}
          </div>
        </div>
      </nav>
      <div className="mx-auto max-w-screen-2xl px-4 pt-4 pb-16">
        {transition.type === "normalLoad" && transition.state === "loading" ? (
          <div className="min-h-minitems-center flex justify-center">
            <span className="animate-pulse text-stone-500">Loading...</span>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 text-white/90">
        <div className="mx-auto flex max-w-screen-2xl flex-nowrap justify-center">
          {[
            {
              title: "View",
              icon: BiHome,
              path: "/",
            },
            {
              title: "Create",
              icon: BiPencil,
              path: "/create",
              hide: !user,
            },
            {
              title: "Search",
              icon: BiSearch,
              path: "/search",
            },
          ]
            .filter((navEntry) => !navEntry.hide)
            .map((navEntry) => (
              <NavLink
                key={navEntry.path}
                to={navEntry.path}
                className={({ isActive }) =>
                  "flex flex-1 flex-col items-center bg-stone-500/80 p-2 backdrop-blur-lg transition duration-300 ease-in-out first:rounded-tl-lg last:rounded-tr-lg md:w-24 md:flex-none " +
                  (isActive ? "bg-stone-600/80" : "")
                }
              >
                {createElement(navEntry.icon)}
                <p>{navEntry.title}</p>
              </NavLink>
            ))}
        </div>
      </div>
    </>
  );
}
