import { Action, ActionPanel, Form, LaunchProps } from "@raycast/api";

interface quickMsgArguments {
  contact: string;
  message: string;
}
export default function QuickMsg(props: LaunchProps<{ arguments: quickMsgArguments }>) {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Send Message" />
        </ActionPanel>
      }
    >
      <Form.TextField id="contact" title="Contact" defaultValue={props.arguments.contact} />
      <Form.TextArea id="message" title="Message" defaultValue={props.arguments.message} />
    </Form>
  );
}
