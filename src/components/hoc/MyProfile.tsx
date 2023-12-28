import { useQuery, gql } from "@apollo/client";
import { Content, Tabs } from "react-bulma-components";
import { Link } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import { ClipLoader } from 'react-spinners';

import { DialogBox } from "src/components/DialogBox";
import { Tab } from "src/components/Tab";
import type { Party } from "src/types";

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
  const { loading, error, data } = useQuery(gql`
    {
      parties {
        code
        name
        isProtected
        isClosed
        participantCount
      }
    }
  `, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <>
      {(loading && !data)
        ? (
          <Content style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ClipLoader />
          </Content>
        )
        : (
          <Content>
            <ul>
              {data?.parties.map(
                ({ code, name }: Party) => (
                  <li key={code}>
                    <Link to={`/p/${code}/`}>
                      {name}
                    </Link>
                  </li>
                ))
              }
            </ul>
          </Content>
        )
      }
    </>
  )
};
