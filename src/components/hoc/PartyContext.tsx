import React from "react";
import type { Party } from "src/types";

type Context = {
  party?: Party,
};

export const PartyContext = React.createContext<Context>({});

export const usePartyContext = () => React.useContext(PartyContext);
