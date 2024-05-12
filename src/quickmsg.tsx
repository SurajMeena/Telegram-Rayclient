import { Detail, LaunchProps } from "@raycast/api";
import { useContext, useEffect, useState } from "react";
import { getSession, returnClient } from "./utils/tgClient";
import { TelegramClient } from "telegram";
import LoginForm from "./views/loginForm";
import { SessionContext } from "./utils/sessionContext";

interface quickMsgArguments {
  contact: string;
  message: string;
}
let client: TelegramClient;

function App(props: quickMsgArguments) {
  const { session } = useContext(SessionContext);
  useEffect(() => {
    (async () => {
      client = await returnClient();
      await client.connect();
      try {
        await client.sendMessage("me", { message: props.message });
      } catch (e) {
        console.log("Error sending message: ", e);
      }
    })();
  }, []);

  return session != "" ? (
    <Detail
      isLoading={session === undefined}
      markdown={`Last Message Sent: ${props.message} to user ${props.contact}`}
    />
  ) : (
    <LoginForm />
  );
}
export default function QuickMsg(props: LaunchProps<{ arguments: quickMsgArguments }>) {
  const [session, setSession] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    (async () => {
      const sessionValue = await getSession();
      setSession(sessionValue);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return <Detail isLoading />;
  }

  // TODO: user doesn't have to return back to send message, after login form we should consider the props arguments and send the message
  return (
    <SessionContext.Provider
      value={{
        session,
        setSession: (value) => {
          setSession(value);
          // if (!value) {
          //   logout();
          // }
        },
      }}
    >
      <App contact={props.arguments.contact} message={props.arguments.message} />
    </SessionContext.Provider>
  );
}
