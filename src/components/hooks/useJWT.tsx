import * as jose from "jose";
import React from "react";

import { issuer, publicKey as PUBLIC_KEY } from 'src/config.json';

// Tokens from api.gnomik.me are ES256. The public key is not a secret, so it lives in config.json; it has to match
// the API's JWT_PRIVATE_KEY.

export const useJWT = () => {
  const [publicKey, setPublicKey] = React.useState<jose.KeyLike>();

  React.useEffect(
    () => {
      (async function () {
        setPublicKey(await jose.importSPKI(PUBLIC_KEY, 'ES256'));
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
