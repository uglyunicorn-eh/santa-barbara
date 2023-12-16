import { Button } from "react-bulma-components";

import { DialogBox } from "src/components/DialogBox";

export const JoinParty = () => {
  return (
    <DialogBox
      className="party-box"
      title="Join a party!"
      action={<Button color="primary">&#x1F973; Here I come!</Button>}
    >
      Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti iusto aliquid alias doloremque facilis. In quis officiis eos esse ipsam labore consequatur. Numquam quo reprehenderit illo odit corrupti accusantium atque!
    </DialogBox>
  )
};
