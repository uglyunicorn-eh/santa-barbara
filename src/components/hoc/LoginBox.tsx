import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import { Container, Hero } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Landing } from "@/components/Landing";
import { UnsplashCredit } from "@/components/UnsplashCredit";
import { Footer } from "@/components/hoc/Footer";
import { TINTS, usePageTint } from "@/components/hooks";

// The sign-in form loads on its own: in the background once the page is idle, or as soon as the Enter button is hovered
// or focused, so it's there by the click without holding up the front door's first paint.
const loadEnterForm = () => import("@/components/hoc/EnterForm");
const EnterForm = React.lazy(() => loadEnterForm().then(m => ({ default: m.EnterForm })));

export const LoginBox = () => {
  usePageTint(TINTS.loginDoor);

  React.useEffect(() => {
    const idle = window.requestIdleCallback ?? ((load: () => void) => setTimeout(load, 1500));
    idle(() => void loadEnterForm());
  }, []);

  return (
    <Landing
      enter={
        <Routes>
          <Route path="/" Component={EnterActions} />
          {/* The sign-in form opens over the front door, which stays as it was behind it. */}
          <Route path="/enter/" element={<><EnterActions /><React.Suspense fallback={null}><EnterForm /></React.Suspense></>} />
          {/* Signed out, every other page (the profile, a new party…) is the front door. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      }
      enterAgain={<EnterActions label="Let's get this party started!" />}
      footer={<DoorFooter />}
    />
  );
};

const DoorFooter = () => (
  <Footer noUser noHome profileAsLink>
    <UnsplashCredit id="k0nfntv2Dgs" name="Call Me Fred" username="callmefred" />
  </Footer>
);

export const LoginHero = ({ children }: { children: React.ReactNode }) => {
  usePageTint(TINTS.loginDoor);
  return <LoginHeroPage>{children}</LoginHeroPage>;
};

const LoginHeroPage = ({ children }: { children: React.ReactNode }) => (
  <Hero size={"fullheight"} className="login-container">
    <Hero.Body>
      <Container textAlign="centered">
        <div className="enter-bezel">{children}</div>
      </Container>
    </Hero.Body>

    <Hero.Footer>
      <DoorFooter />
    </Hero.Footer>
  </Hero>
);

const EnterActions = ({ label = "Enter with your email address" }: { label?: string }) => {
  const navigate = useNavigate();

  // The dialog opens on the click, and the page steps back behind it at the same moment (GrinchDialog).
  const onLoginClick = React.useCallback(() => navigate("/enter/"), [navigate]);

  return (
    <Button variant="brand" size="lg" surface="dark" pill onClick={onLoginClick} onPointerEnter={loadEnterForm} onFocus={loadEnterForm}>
      {label}
    </Button>
  );
}
