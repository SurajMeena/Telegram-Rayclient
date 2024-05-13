import { Detail, LaunchProps } from "@raycast/api";
import { useContext, useEffect, useState } from "react";
import { getSession, returnClient } from "./utils/tgClient";
import { TelegramClient } from "telegram";
import LoginForm from "./views/loginForm";
import { SessionContext } from "./contexts/sessionContext";
import { ClientContext } from "./contexts/clientContext";

interface quickMsgArguments {
  contact: string;
  message: string;
}
// let client: TelegramClient;

function App(props: quickMsgArguments) {
  const { session } = useContext(SessionContext);
  const { globalClient } = useContext(ClientContext);
  console.log("global client: ", globalClient);
  useEffect(() => {
    (async () => {
      // client = await returnClient();
      if(globalClient === undefined) {
        console.log("Client is undefined")
        return;
      }
      await globalClient.connect();
      try {
        await globalClient.sendMessage("me", { message: props.message });
      } catch (e) {
        console.log("Error sending message: ", e);
      }
    })();
  }, [globalClient]);

  return (globalClient != undefined && session) != "" ? (
    <Detail markdown={`Last Message Sent: ${props.message} to user ${props.contact}`} />
  ) : (
    <LoginForm />
  );
}
export default function QuickMsg(props: LaunchProps<{ arguments: quickMsgArguments }>) {
  const [session, setSession] = useState<string>("");
  const [globalClient, setGlobalClient] = useState<TelegramClient | undefined>(undefined);
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
      <ClientContext.Provider
        value={{
          globalClient,
          setGlobalClient: (value) => {
            setGlobalClient(value);
          },
        }}
      >
        <App contact={props.arguments.contact} message={props.arguments.message} />
      </ClientContext.Provider>
    </SessionContext.Provider>
  );
}
