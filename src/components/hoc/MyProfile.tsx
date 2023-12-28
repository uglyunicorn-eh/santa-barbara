import { Content, Tabs } from "react-bulma-components";
import { DialogBox } from "src/components/DialogBox";

export const MyProfile = () => {
  return (
    <DialogBox
      className={"profile-box"}
      noHeader
    // title={"Anonymous Profile"}
    // cardStyle={{
    //   width: 600,
    // }}
    >
      <Tabs size={"large"} align={"center"}>
        <Tabs.Tab active>
          Profile
        </Tabs.Tab>
        <Tabs.Tab>
          Parties History
        </Tabs.Tab>
      </Tabs>
      <Content>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, quam molestias! Provident, quas rem a eos dicta perferendis suscipit quam molestiae pariatur possimus veritatis beatae repellat blanditiis velit expedita illo?</p>
      </Content>
    </DialogBox>
  );
};
