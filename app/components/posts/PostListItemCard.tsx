import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { BiDotsVerticalRounded, BiShareAlt } from "react-icons/bi";
import { FaLaughSquint } from "react-icons/fa";
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
};

export default function PostListItemCard(props: PostListItemCardProps) {
  const { post } = props;
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
          <div className="flex flex-1">
            <IconButton
              icon={reactions.none}
              size={24}
              onClick={() => {}}
              title="React"
            />
          </div>
          <div className="flex flex-1">
            <IconButton
              icon={RiStarLine}
              size={24}
              onClick={() => {}}
              title="Star"
            />
          </div>
          <div className="flex flex-1">
            <IconButton
              icon={RiReplyLine}
              size={24}
              onClick={() => {}}
              title="Reply"
            />
          </div>
          <div className="flex flex-1">
            <IconButton
              icon={BiShareAlt}
              size={24}
              onClick={() => {}}
              title="Share"
            />
          </div>
        </div>
      </div>
      <div className="pt-1">
        <DropdownMenu items={[]}>
          <IconButton
            icon={BiDotsVerticalRounded}
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
