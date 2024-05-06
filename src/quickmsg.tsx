import { Action, ActionPanel, Form, LaunchProps } from "@raycast/api";
import { useRef, useState } from "react";
import { sessions, TelegramClient } from "telegram";
import { StoreSession, StringSession } from "telegram/sessions";

interface quickMsgArguments {
  contact: string;
  message: string;
}

export default function Command(props: LaunchProps<{ arguments: quickMsgArguments }>) {
  const [contact, setContact] = useState(props.arguments.contact);
  const [message, setMessage] = useState(props.arguments.message);
  const [phoneCode, setPhoneCode] = useState<string>("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const apiId = 12345;
  const apiHash = "1234567890abcdef1234567890abcdef";
  // const storeSession = new StoreSession("./");
  const session = new StringSession(""); // fill this later with the value from session.save()
  const phoneNo = "+1234567890";
  const resolver = useRef<((value: string | PromiseLike<string>) => void) | null>(null);
  const phoneCodePromise = useRef<Promise<string> | null>(null);
  // https://stackoverflow.com/questions/73967855/cannot-assign-to-current-because-it-is-a-read-only-property
  if (!phoneCodePromise.current) {
    phoneCodePromise.current = new Promise((resolve) => {
      console.log("Promise created");
      resolver.current = resolve;
    });
  }
  // const phoneCodePromise: Promise<string> = new Promise((resolve) => {
  //   console.log("Promise created");
  //   phoneCodeResolver.current = resolve;
  //   console.log(phoneCodeResolver.current);
  // });
  const handleCodeSubmit = () => {
    if (resolver.current) {
      resolver.current(phoneCode);
    }
  };
  return (
    <>
      <Form
        actions={
          <ActionPanel>
            <Action.SubmitForm
              title="Send Message"
              onSubmit={async () => {
                const client = new TelegramClient(session, apiId, apiHash, {
                  connectionRetries: 5
                });
                setIsCodeSent(true);
                await client.start({
                  phoneNumber: phoneNo,
                  // password: async () => pwd,
                  phoneCode: async (isCodeViaApp = true) => await phoneCodePromise.current ?? new Promise((resolve) => {resolve("")}),
                  onError: (err) => {
                    console.log(err);
                  }
                });
                console.log("You should now be connected.");
                console.log(client.session.save())
                await client.sendMessage("me", { message: message });
              }}
            />
          </ActionPanel>
        }
      >
        <Form.TextField id="contact" title="Contact" value={contact} onChange={setContact} />
        <Form.TextField id="message" title="Message" value={message} onChange={setMessage} />
      </Form>
      {isCodeSent && (
        <>
          <Form
            actions={
              <ActionPanel>
                <Action.SubmitForm title="Save Phone Code" onSubmit={handleCodeSubmit} />
              </ActionPanel>
            }
          >
            <Form.TextField id="phoneCode" title="phoneCode" value={phoneCode} onChange={setPhoneCode} />
          </Form>
        </>
      )}
    </>
  );
}
