import { TelegramClient } from "telegram";
import { useEffect, useState } from "react";
import { Action, ActionPanel, Form, getPreferenceValues, LocalStorage } from "@raycast/api";
import { preferences, returnClient } from "../utils/tgClient";

let loginClient: TelegramClient;

export default function LoginForm(props: { setGlobalClient: (client: TelegramClient) => void }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const { api_id, api_hash } = getPreferenceValues<preferences>();
  const [isLoading, setIsLoading] = useState(true);

  // TODO: handle errors carefully
  useEffect(() => {
    (async () => {
      console.log("requested client from login form");
      loginClient = await returnClient();
      props.setGlobalClient(loginClient);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return <Form isLoading />;
  }

  async function sendCodeHandler(): Promise<void> {
    await loginClient.connect();
    await loginClient.sendCode(
      {
        apiId: parseInt(api_id),
        apiHash: api_hash,
      },
      phoneNumber
    );
    setIsCodeSent(true);
  }

  async function clientStartHandler(): Promise<void> {
    await loginClient.start({
      phoneNumber,
      password: userAuthParamCallback(password),
      phoneCode: userAuthParamCallback(phoneCode),
      onError: (err) => {
        console.log(err);
      },
    });
    await LocalStorage.setItem("session", JSON.stringify(loginClient.session.save()));
    await loginClient.sendMessage("me", { message: "You're successfully logged in!" });
  }

  function userAuthParamCallback<T>(param: T): () => Promise<T> {
    return async function () {
      return await new Promise<T>((resolve) => {
        resolve(param);
      });
    };
  }

  return (
    <>
      {!isCodeSent ? (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm onSubmit={sendCodeHandler} />
            </ActionPanel>
          }
        >
          <Form.TextField id="phoneNumber" title="phoneNumber" value={phoneNumber} onChange={setPhoneNumber} />
          <Form.PasswordField id="password" title="password" value={password} onChange={setPassword} />
        </Form>
      ) : (
        <Form
          actions={
            <ActionPanel>
              <Action.SubmitForm onSubmit={clientStartHandler} />
            </ActionPanel>
          }
        >
          <Form.TextField id="phoneCode" title="phoneCode" value={phoneCode} onChange={setPhoneCode} />
        </Form>
      )}
    </>
  );
}
