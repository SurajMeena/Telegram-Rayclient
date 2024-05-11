import { TelegramClient } from "telegram";
import { useEffect, useState } from "react";
import { Action, ActionPanel, Form, getPreferenceValues, LocalStorage } from "@raycast/api";
import { preferences, returnClient } from "../utils/tgClient";

let client: TelegramClient;

export default function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const { api_id, api_hash } = getPreferenceValues<preferences>();
  // TODO: handle errors carefully
  useEffect(() => {
    (async () => {
      client = await returnClient();
    })();
  }, []);

  async function sendCodeHandler(): Promise<void> {
    await client.connect();
    await client.sendCode(
      {
        apiId: parseInt(api_id),
        apiHash: api_hash,
      },
      phoneNumber
    );
    setIsCodeSent(true);
  }

  async function clientStartHandler(): Promise<void> {
    await client.start({
      phoneNumber,
      password: userAuthParamCallback(password),
      phoneCode: userAuthParamCallback(phoneCode),
      onError: (err) => {
        console.log(err);
      },
    });
    await LocalStorage.setItem("session", JSON.stringify(client.session.save()));
    await client.sendMessage("me", { message: "You're successfully logged in!" });
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
