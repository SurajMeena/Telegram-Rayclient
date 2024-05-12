import { LocalStorage, getPreferenceValues } from "@raycast/api";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

export interface preferences {
  api_id: string;
  api_hash: string;
}

let SESSION: StringSession;

// TODO: check how can we close the client connection
const { api_id, api_hash } = getPreferenceValues<preferences>();
export const returnClient = async () => {
  const session = await getSession();
  SESSION = new StringSession(session);
  return new TelegramClient(SESSION, parseInt(api_id), api_hash, { connectionRetries: 5 });
};

export async function getSession() {
  const session = await LocalStorage.getItem<string>("session");
  return session ? JSON.parse(session) : "";
}
