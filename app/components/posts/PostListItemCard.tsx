import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { BiCodeAlt, BiDotsVerticalRounded, BiShareAlt } from "react-icons/bi";
import { FaLaughSquint } from "react-icons/fa";
import { MdBlock, MdDelete, MdReport } from "react-icons/md";
import { RiReplyLine, RiStarLine } from "react-icons/ri";
import type { Post } from "~/models/post.server";
import Avatar from "../ui-kit/Avatar";
import DropdownMenu from "../ui-kit/DropdownMenu";
import IconButton from "../ui-kit/IconButton";

const reactions = {
  like: AiFillLike,
  none: AiOutlineLike,
  laugh: FaLaughSquint,
};

type PostListItemCardProps = {
  post: Post;
  isSelfPost: boolean;
  isAuthenticated: boolean;
};

export default function PostListItemCard(props: PostListItemCardProps) {
  const { post, isSelfPost, isAuthenticated } = props;
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
        <p className="font-semibold text-slate-400/90">{post.creator.name}</p>
        <p className="text-slate-300/80">{post.body}</p>
        <div className="flex items-center justify-between pt-1">
          <IconButton
            icon={reactions.none}
            size={24}
            onClick={() => {}}
            title="React"
          />
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
