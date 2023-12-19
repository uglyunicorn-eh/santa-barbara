import React from "react";

type JoinPartyInput = {
  code: string;
}

type ApiResponse<T> = {
  data: T | null;
  errors?: string[];
};

const error = (message: string): ApiResponse<null> => ({
  data: null,
  errors: [message],
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const useAppClient = () => {
  const joinParty = React.useCallback(
    async (data: JoinPartyInput) => {
      console.log("API joinParty", { data });
      await sleep(500);
      return error("Hm... we cannot find any party for the code. Please check the code and try again...");
    },
    [],
  );

  return React.useMemo(
    () => ({
      joinParty,
    }),
    [
      joinParty,
    ],
  );
};
