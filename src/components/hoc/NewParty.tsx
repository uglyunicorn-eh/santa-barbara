import { Button, Content, Form } from "react-bulma-components";

import { DialogBox } from "src/components/DialogBox";

export const NewParty = () => {
  return (
    <DialogBox
      className="party-box"
      title="Let's start a new party!"
      action={<Button color="primary">&#x1F389; Rock'n'Roll!</Button>}
    >
      <Content>

        <Form.Field horizontal>
          <Form.Label>Party name</Form.Label>
          <Form.Field.Body>
            <Form.Control>
              <Form.Input value={"Very funny secret party!"} />
            </Form.Control>
            <Form.Help color="danger">Party name is a required field</Form.Help>
          </Form.Field.Body>
        </Form.Field>

        <Form.Field horizontal>
          <Form.Label>Secret phrase</Form.Label>
          <Form.Field.Body>
            <Form.Control>
              <Form.Input placeholder="Optional" />
            </Form.Control>
            <Form.Help>Everyone must know this phrase for entry. Leave it blank to allow access via a shared link.</Form.Help>

            <p>
              Have a question? See <a href="/how-it-works/">how this works</a>.
            </p>
          </Form.Field.Body>
        </Form.Field>

      </Content>
    </DialogBox>
  )
};
