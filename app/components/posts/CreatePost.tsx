import { useFetcher } from "@remix-run/react";
import { useRef, useState } from "react";
import { BiImageAdd, BiLocationPlus, BiPoll } from "react-icons/bi";
import type { Profile } from "~/models/profile.server";
import type { PostsLoaderData } from "~/routes/__social/__posts";
import Avatar from "../ui-kit/Avatar";
import IconButton from "../ui-kit/IconButton";

type CreatePostProps = {
  currentUser: Profile | null;
};

export default function CreatePost({ currentUser }: CreatePostProps) {
  const fetcher = useFetcher<PostsLoaderData>();
  const imagesToPost: File[] = [];
  const pollChoices: string[] = [];
  const [postText, setPostText] = useState("");
  const hasContent =
    imagesToPost.length || pollChoices.length || postText?.trim();
  const postTextRef = useRef<HTMLTextAreaElement>(null);
  const hasUser = currentUser?.id;
  return hasUser ? (
    <fetcher.Form method="post" action="/create">
      <div className="flex gap-x-2">
        <Avatar src={currentUser.avatar_url} alt="Profile" size={32} />
        <div className="w-full rounded border border-slate-500/30 p-2">
          <textarea name="postText" ref={postTextRef} hidden />
          <div
            className="w-full resize-none outline-none"
            onInput={(event) => {
              const value = event.currentTarget.innerText ?? "";
              setPostText(value);
              postTextRef.current!.value = value;
            }}
            contentEditable
          />
          <div className="flex items-end justify-between">
            <div className="flex gap-x-1">
              {[
                {
                  key: "upload-photo",
                  onClick: () => {},
                  icon: BiImageAdd,
                  size: 18,
                  title: "Add photos",
                },
                {
                  key: "add-poll",
                  onClick: () => {},
                  icon: BiPoll,
                  size: 18,
                  title: "Add a poll",
                },
                {
                  key: "add-location",
                  onClick: () => {},
                  icon: BiLocationPlus,
                  size: 18,
                  title: "Add location",
                },
              ].map(({ key, icon, ...props }) => (
                <IconButton key={key} icon={icon} {...props} />
              ))}
            </div>
            <div>
              <button
                type="submit"
                name="action"
                value="create"
                className={`rounded px-2 py-1  ${
                  hasContent
                    ? "bg-slate-500 text-white"
                    : "bg-slate-500/30 text-white/30"
                }`}
                disabled={!hasContent}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </fetcher.Form>
  ) : null;
}
