import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Avatar from "~/components/ui-kit/Avatar";
import type { Profile } from "~/models/profile.server";

type LoaderData = {
  friend: Profile;
};

export const loader: LoaderFunction = ({ request, params }) => {
  const chatId = params.chatId;
  return {
    friend: {
      name: "Some Guy",
      avatar: "https://picsum.photos/200/300",
    },
  };
};

export default function Chat() {
  const { friend } = useLoaderData<LoaderData>();
  return (
    <div className="h-screen overflow-hidden">
      <div className="flex items-center gap-x-4">
        <Avatar src={friend.avatar_url} alt="User profile" size={32} />
        <p>{friend.name}</p>
      </div>
      <div className="flex flex-1 flex-col justify-end">
        <div className="flex items-end">
          <p>Hi Hello</p>
        </div>
        <div>
          <p>Hi Hello</p>
        </div>
      </div>
    </div>
  );
}
