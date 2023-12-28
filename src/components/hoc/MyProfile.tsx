import { useQuery } from "@apollo/client";
import { Content, Tabs } from "react-bulma-components";
import { Route, Routes } from "react-router-dom";

import { DialogBox } from "src/components/DialogBox";
import { Tab } from "src/components/Tab";

export const MyProfile = () => (
  <DialogBox
    className={"profile-box"}
    noHeader
    dismissLabel={"Okie Dokie!"}
    cardStyle={{
      width: 800,
    }}
  >
    <Tabs size={"large"} align={"center"} fullwidth>
      <Tab to="/profile/" exact>Profile</Tab>
      <Tab to="/profile/history/">Latest history</Tab>
    </Tabs>
    <Content>
      <Routes>
        <Route path="" Component={Profile} />
        <Route path="history/" Component={History} />
      </Routes>
    </Content>
  </DialogBox>
);

const Profile = () => {
  return (
    <>
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Non explicabo quae excepturi temporibus atque ipsum distinctio, ad repellat, sequi libero, quaerat minus accusantium! Corrupti, delectus laboriosam aliquid sequi corporis deleniti!
    </>
  )
};

const History = () => {
  useQuery()
  return (
    <>
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Non explicabo quae excepturi temporibus atque ipsum distinctio, ad repellat, sequi libero, quaerat minus accusantium! Corrupti, delectus laboriosam aliquid sequi corporis deleniti!
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Non explicabo quae excepturi temporibus atque ipsum distinctio, ad repellat, sequi libero, quaerat minus accusantium! Corrupti, delectus laboriosam aliquid sequi corporis deleniti!
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Non explicabo quae excepturi temporibus atque ipsum distinctio, ad repellat, sequi libero, quaerat minus accusantium! Corrupti, delectus laboriosam aliquid sequi corporis deleniti!
    </>
  )
};
