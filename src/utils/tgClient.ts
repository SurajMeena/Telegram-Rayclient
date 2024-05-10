import { LocalStorage, getPreferenceValues } from "@raycast/api";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

export interface preferences {
  api_id: string;
  api_hash: string;
}

let SESSION: StringSession;

const { api_id, api_hash } = getPreferenceValues<preferences>();
export const returnClient = async () => {
  const session = await LocalStorage.getItem<string>("session");
  SESSION = new StringSession(session ? JSON.parse(session) : "");
  return new TelegramClient(SESSION, parseInt(api_id), api_hash, { connectionRetries: 5 });
};

