import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { BiSend } from "react-icons/bi";
import Avatar from "~/components/ui-kit/Avatar";
import IconButton from "~/components/ui-kit/IconButton";
import type { Message } from "~/models/message.server";
import {
  getMessagesForConversation,
  sendMessage
} from "~/models/message.server";
import type { Profile } from "~/models/profile.server";
import { getProfile } from "~/models/profile.server";
import { supabaseClient } from "~/services/supabase.client";
import { authCookie } from "~/services/supabase.server";
import { getSessionUser } from "~/session.server";
import { useProfile } from "~/utils";

type LoaderData = {
  receipient: Profile;
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

  return json(
    {
      receipient,
      messages,
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
  const { receipient, messages: initialMessages } = useLoaderData<LoaderData>();

  const fetcher = useFetcher();

  const messageFormRef = useRef<HTMLFormElement>(null);

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    const subscription = supabaseClient
      .from(`messages:sender_id=eq.${receipient.id}`)
      .on("INSERT", (payload) => {
        setMessages((messages) => [...messages, payload.new]);
      })
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (fetcher.data?.done && fetcher.data.message) {
      setMessages((messages) => [...messages, fetcher.data.message]);
      messageFormRef.current?.reset();
    }
  }, [fetcher.data]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-x-4 py-4">
        <Avatar src={receipient.avatar_url} alt="User profile" size={32} />
        <p>{receipient.name}</p>
      </div>
      <div className="h-[75vh] overflow-y-auto rounded-md bg-stone-300/5 p-4">
        <div className="flex flex-col justify-end gap-y-2">
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
