import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BiSend } from "react-icons/bi";
import Avatar from "~/components/ui-kit/Avatar";
import IconButton from "~/components/ui-kit/IconButton";
import type { Message } from "~/models/message.server";
import {
  getMessagesForConversation,
  sendMessage
} from "~/models/message.server";
import type { PresenceResponse } from "~/models/presence.server";
import { getUserPresence } from "~/models/presence.server";
import type { Profile } from "~/models/profile.server";
import { getProfile } from "~/models/profile.server";
import { supabaseClient } from "~/services/supabase.client";
import { authCookie } from "~/services/supabase.server";
import { getSessionUser } from "~/session.server";
import { getAgoDate, getPresenceWithStatus, useProfile } from "~/utils";

type LoaderData = {
  receipient: Profile & { presence: PresenceResponse };
  messages: Message[];
};

export const action: ActionFunction = async ({ request, params }) => {
  const receipientId = params.userId as string;
  const { user: sender, session } = await getSessionUser(request);
  const formData = await request.formData();
  const formAction = formData.get("action") as string;

  switch (formAction) {
    case "sendMessage":
      const text = formData.get("text") as string;
      if (!sender?.id)
        throw new Response("You are unauthorized", {
          status: 401,
          headers: session && {
            "Set-Cookie": await authCookie.commitSession(session),
          },
        });
      const { data: message, error } = await sendMessage({
        receiver_id: receipientId,
        sender_id: sender.id,
        text,
        image_urls: [],
      });

      return json({
        done: !error,
        message,
        error: error ? "Could not send message" : "",
      });
    default:
      throw new Response("Invalid action", {
        status: 400,
        headers: session && {
          "Set-Cookie": await authCookie.commitSession(session),
        },
      });
  }
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user, session, error } = await getSessionUser(request);
  const receipientId = params.userId as string;

  const { data: receipient } = await getProfile(receipientId);

  if (!user || !session || error) {
    const session = await authCookie.getSession(request.headers.get("Cookie"));
    return redirect("/", {
      headers: {
        "Set-Cookie": await authCookie.destroySession(session),
      },
    });
  }

  const { data: messages } = await getMessagesForConversation(
    user.id,
    receipientId
  );

  const { data: presence } = await getUserPresence(receipientId);

  return json(
    {
      receipient: {
        ...receipient,
        presence,
      },
      messages: messages ?? [],
    },
    {
      headers: session && {
        "Set-Cookie": await authCookie.commitSession(session),
      },
    }
  );
};

export default function Chat() {
  const user = useProfile();
  const { receipient: initialReceipient, messages: initialMessages } =
    useLoaderData<LoaderData>();

  const fetcher = useFetcher();

  const messageFormRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const statusIntervalRef = useRef<NodeJS.Timer | null>(null);

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [receipient, setReceipient] = useState<PresenceResponse>(
    initialReceipient?.presence
  );

  const [isAtEnd, setIsAtEnd] = useState(true);

  const resolveReceipientStatus = (presence: PresenceResponse) => {
    setReceipient(getPresenceWithStatus(presence));
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
    }
    statusIntervalRef.current = setInterval(() => {
      setReceipient(getPresenceWithStatus(presence));
    }, 3000);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current?.scrollHeight,
    });
  };

  useEffect(() => {
    const messagesSubscription = supabaseClient
      .from(`messages:sender_id=eq.${initialReceipient.id}`)
      .on("INSERT", (payload) => {
        setMessages((messages) => [...messages, payload.new]);
        const isAtEnd =
          scrollRef.current?.scrollHeight === scrollRef.current?.scrollTop;
        setIsAtEnd(isAtEnd);
      })
      .subscribe();
    resolveReceipientStatus(initialReceipient.presence);
    const statusSubscription = supabaseClient
      .from<PresenceResponse>(`presences:profile_id=eq.${initialReceipient.id}`)
      .on("INSERT", (payload) => resolveReceipientStatus(payload.new))
      .on("UPDATE", (payload) => resolveReceipientStatus(payload.new))
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      statusSubscription.unsubscribe();
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fetcher.data?.done && fetcher.data.message) {
      setMessages((messages) => [...messages, fetcher.data.message]);
      messageFormRef.current?.reset();
      const isAtEnd =
        scrollRef.current?.scrollHeight === scrollRef.current?.scrollTop;
      setIsAtEnd(isAtEnd);
    }
  }, [fetcher.data]);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [isAtEnd]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-x-4 py-4">
        <Avatar
          src={initialReceipient.avatar_url}
          alt="User profile"
          size={32}
        />
        <div className="flex flex-col">
          <p>{initialReceipient.name}</p>
          <div className="flex items-center gap-x-2">
            <span
              className={`h-3 w-3 rounded-full ${
                receipient?.status === "online"
                  ? "bg-green-500"
                  : "border border-stone-500/60"
              }`}
            />
            {receipient && (
              <p className="text-stone-500/60">
                {receipient?.status === "online"
                  ? "Online"
                  : `Last seen: ${getAgoDate(receipient.last_seen)}`}
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="h-[75vh] overflow-y-auto scroll-smooth rounded-md bg-stone-300/5 p-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600"
      >
        <div className="flex min-h-[70vh] flex-col justify-end gap-y-2">
          {messages?.map((message) => (
            <div
              key={message.id}
              className={`flex items-center ${
                message.sender_id === user.id ? "justify-end" : ""
              }`}
            >
              <div
                className={`rounded-md py-1 px-2 ${
                  message.sender_id === user.id
                    ? "rounded-br-none bg-slate-500/80"
                    : "rounded-bl-none bg-stone-500/90"
                }`}
              >
                <p>{message.text}</p>
                <p className="text-[10px] text-slate-400/90">
                  {Intl.DateTimeFormat("en-GB", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(message.created_at))}
                </p>
              </div>
            </div>
          ))}
          <fetcher.Form className="pt-4" method="post" ref={messageFormRef}>
            <div className="flex items-center justify-between gap-x-2 rounded-md border border-slate-500/80 bg-stone-500/30 p-2">
              <input
                className="w-full resize-none bg-transparent outline-none"
                type="text"
                name="text"
              ></input>
              <button type="submit" name="action" value="sendMessage">
                <IconButton icon={BiSend} size={24} title="Send" />
              </button>
            </div>
          </fetcher.Form>
        </div>
      </div>
    </div>
  );
}
