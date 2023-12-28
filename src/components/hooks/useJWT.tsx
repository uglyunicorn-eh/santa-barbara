import * as jose from "jose";
import React from "react";

import { issuer } from 'src/config.json';

const PUBLIC_KEY = import.meta.env.PUBLIC_KEY.split('\\n').join('\n');

export const useJWT = () => {
  const [publicKey, setPublicKey] = React.useState<jose.KeyLike>();

  React.useEffect(
    () => {
      (async function () {
        setPublicKey(await jose.importSPKI(PUBLIC_KEY, 'RS256'));
      })();
    },
    [],
  );

  const verify = React.useCallback(
    async function <T>(token: string) {
      if (!publicKey) {
        throw new Error("Public key not loaded");
      }

      return jose.jwtVerify<T>(token, publicKey, { issuer });
    },
    [
      publicKey,
    ],
  );

  const decode = React.useCallback(
    function <T>(token: string) {
      return jose.decodeJwt<T>(token);
    },
    [],
  );

  return React.useMemo(
    () => ({
      isReady: !!publicKey,
      verify,
      decode,
    }),
    [
      publicKey,
      verify,
      decode,
    ],
  );
};
