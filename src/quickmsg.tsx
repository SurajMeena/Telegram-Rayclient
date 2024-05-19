import { Detail, LaunchProps } from "@raycast/api";
import { useContext, useEffect, useState } from "react";
import { getSession } from "./utils/tgClient";
import { Api, TelegramClient } from "telegram";
import LoginForm from "./views/loginForm";
import { SessionContext } from "./contexts/sessionContext";
import { ClientContext } from "./contexts/clientContext";
import util from "util";

interface quickMsgArguments {
  contact: string;
  message: string;
}
interface Contact {
  username: string;
  firstName?: string;
  lastName?: string;
}
function App(props: quickMsgArguments) {
  const { session } = useContext(SessionContext);
  const { globalClient } = useContext(ClientContext);
  const [sentTo, setSentTo] = useState<Contact>({ username: "me" });

  useEffect(() => {
    (async () => {
      console.log("Connecting client after fetching a new one");
      if (globalClient === undefined) {
        console.log("Client is undefined");
        return;
      }
      await globalClient.connect();
      try {
        const result: Api.contacts.Found = await globalClient.invoke(
          new Api.contacts.Search({
            q: props.contact,
            limit: 3,
          })
        );
        const users: Api.User[] = (result.users as Api.User[]).filter(
          (user) => user.bot === false && user.contact == true && user.username != null
        );
        // console.log(
        //   util.inspect(users, {
        //     showHidden: false,
        //     depth: null,
        //   })
        // );
        const username = users[0].username;
        if (username) {
          await globalClient.sendMessage(username, { message: props.message });
          setSentTo({ username: username, firstName: users[0].firstName, lastName: users[0].lastName });
        }
      } catch (e) {
        console.log("Error sending message: ", e);
      }
    })();
    return () => {
      console.log("Disconnecting client");
      globalClient?.disconnect();
    };
  }, [globalClient]);

  return (globalClient != undefined && session) != "" ? (
    <Detail
      markdown={`Sent: *${props.message}* to **${sentTo.firstName || ""} ${sentTo.lastName || ""}(${
        sentTo.username
      })**`}
    />
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
