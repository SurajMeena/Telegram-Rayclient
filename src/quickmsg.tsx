import { Detail, LaunchProps, LocalStorage } from "@raycast/api";
import { useEffect, useState } from "react";
import { returnClient } from "./utils/tgClient";
import { TelegramClient } from "telegram";
import LoginForm from "./views/loginForm";

interface quickMsgArguments {
  contact: string;
  message: string;
}
let client: TelegramClient;

export default function QuickMsg(props: LaunchProps<{ arguments: quickMsgArguments }>) {
  const [session, setSession] = useState<string | undefined>(undefined);
  useEffect(() => {
    (async () => {
      const sessionValue = await LocalStorage.getItem<string>("session");
      setSession(sessionValue);
    })();
  }, []);
  useEffect(() => {
    (async () => {
      console.log("check print order sequence");
      client = await returnClient();
      await client.connect();
      try {
        await client.sendMessage("me", { message: props.arguments.message });
      } catch (e) {
        console.log("Error sending message: ", e);
      }
    })();
  }, []);
  // TODO: user doesn't have to return back to send message, after login form we should consider the props arguments and send the message
  return (
    <>
      {session ? (
        <Detail
          isLoading={session === undefined}
          markdown={`Last Message Sent: ${props.arguments.message} to user ${props.arguments.contact}`}
        />
      ) : (
        <LoginForm />
      )}
    </>
  );
}
