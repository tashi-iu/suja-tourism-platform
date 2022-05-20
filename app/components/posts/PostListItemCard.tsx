import type { useFetcher } from "@remix-run/react";
import { useCallback } from "react";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { BiCodeAlt, BiDotsVerticalRounded, BiShareAlt } from "react-icons/bi";
import { MdBlock, MdDelete, MdReport } from "react-icons/md";
import { RiReplyLine, RiStarLine } from "react-icons/ri";
import type { Post } from "~/models/post.server";
import { getAgoDate } from "~/utils";
import Avatar from "../ui-kit/Avatar";
import DropdownMenu from "../ui-kit/DropdownMenu";
import IconButton from "../ui-kit/IconButton";

const reactions = {
  liked: AiFillLike,
  none: AiOutlineLike,
};

type PostListItemCardProps = {
  post: Post;
  isSelfPost: boolean;
  isAuthenticated: boolean;
  fetcher: ReturnType<typeof useFetcher>;
};

export default function PostListItemCard(props: PostListItemCardProps) {
  const { post, isSelfPost, isAuthenticated, fetcher } = props;

  const toggleLike = useCallback(() => {
    const formData = new FormData();
    formData.append("liked", (!post.liked).toString());
    formData.append("postId", post.id);
    fetcher.submit(formData, {
      action: "/like",
      method: "post",
    });
  }, [fetcher, post.id, post.liked]);

  return (
    <div
      key={`post-${post.id}`}
      className="shadow-stone-700/15 flex cursor-pointer gap-x-2 rounded-xl bg-stone-700/40 p-4 shadow-xl transition duration-150 ease-in-out hover:bg-stone-700/30"
    >
      <div className="pt-1">
        <Avatar
          src={post.creator.avatar_url}
          alt="Post creator's profile"
          size={38}
        />
      </div>
      <div className="flex flex-1 flex-col gap-y-1">
        <div className="flex items-baseline gap-x-2">
          <p className="font-semibold text-slate-400/90">{post.creator.name}</p>
          <p className="font-semibold text-sm text-slate-400/60">
            {getAgoDate(post.created_at)}
          </p>
        </div>
        <p className="font-semiboldtext-slate-300/80">{post.body}</p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center justify-start gap-x-2">
            <IconButton
              icon={post.liked ? reactions.liked : reactions.none}
              size={24}
              onClick={toggleLike}
              title="React"
            />
            <p>{post.total_likes}</p>
          </div>
          <IconButton
            icon={RiStarLine}
            size={24}
            onClick={() => {}}
            title="Star"
          />
          <IconButton
            icon={RiReplyLine}
            size={24}
            onClick={() => {}}
            title="Reply"
          />
          <IconButton
            icon={BiShareAlt}
            size={24}
            onClick={() => {}}
            title="Share"
          />
        </div>
      </div>
      <div className="pt-1">
        <DropdownMenu
          items={[
            ...(isAuthenticated
              ? isSelfPost
                ? [
                    {
                      key: "delete",
                      label: "Delete",
                      onClick: () => {},
                      icon: MdDelete,
                    },
                  ]
                : [
                    {
                      key: "block",
                      label: `Block ${post.creator.name}`,
                      onClick: () => {},
                      icon: MdBlock,
                    },
                    {
                      key: "report",
                      label: "Report this post",
                      onClick: () => {},
                      icon: MdReport,
                    },
                  ]
              : []),
            {
              key: "embed",
              label: "Embed",
              onClick: () => {},
              icon: BiCodeAlt,
            },
          ]}
        >
          <BiDotsVerticalRounded
            onClick={() => {
              //TODO
            }}
            size={24}
            title="Options"
          />
        </DropdownMenu>
      </div>
    </div>
  );
}
