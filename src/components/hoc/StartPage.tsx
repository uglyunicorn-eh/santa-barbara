import { AnimatePresence } from "framer-motion";
import { Columns, Container, Content, Hero } from "@/components/layout";
import { Link, Route, Routes } from "react-router-dom";

import { Divider } from "@/components/Divider";
import { UnsplashCredit } from "@/components/UnsplashCredit";
import { Footer } from "@/components/hoc/Footer";
import { JoinParty } from "@/components/hoc/JoinParty";
import { MyProfile } from "@/components/hoc/MyProfile";
import { NewParty } from "@/components/hoc/NewParty";
import { RolledDialog } from "@/components/hoc/RolledDialog";
import { useRevealReminders } from "@/components/hooks";

import grinchImg from "@/images/grinch.png";

export const StartPage = () => {
  // Rolled parties waiting for the user to reveal whom they give a gift to (live, too).
  useRevealReminders();

  return (
    <Hero size={"fullheight"} className="welcome-page">
      <Hero.Header>
        <Container>
          {/* On phones: the title on the left, the Grinch on the right, as on wider screens. */}
          <div className="welcome-head-phone flex items-center gap-3 px-4 tablet:hidden">
            <h1 className="flex-1 text-left">Welcome to the Anonymous Ded Morozes!</h1>
            <img src={grinchImg.src} alt="Grinch" width={112} height={112} className="shrink-0" />
          </div>
          <Columns vCentered className="max-tablet:hidden">
            <Columns.Column mobile={{ display: "hidden" }}>&nbsp;</Columns.Column>
            <Columns.Column size="one-third" className="tablet:text-right max-tablet:text-center">
              <h1>
                Welcome to the Anonymous Ded Morozes!
              </h1>
            </Columns.Column>
            <Columns.Column mobile={{ display: "hidden" }} narrow>
              <img src={grinchImg.src} style={{ marginBottom: -40 }} alt="Grinch" />
            </Columns.Column>
          </Columns>

        </Container>
      </Hero.Header>

      <Hero.Body>
        <Container>

          <Content textAlign="centered">
            &mdash; So, what are you up to today, my friend?
          </Content>

          <Columns vCentered>
            <Columns.Column size={1} touch={{ display: "hidden" }}>&nbsp;</Columns.Column>
            <Columns.Column className="tablet:text-right">
              <Link to="/new/">
                I wanna start playing this weird game with my soulmates... Let's rock'n'roll!
              </Link>
            </Columns.Column>
            <Columns.Column narrow textAlign="centered" mobile={{ display: "hidden" }}>
              <Divider label="OR" />
            </Columns.Column>
            {/* On phones the two choices stack, with the divider lying flat between them: — OR —, close to both. */}
            <Columns.Column tablet={{ display: "hidden" }} className="-my-2 py-0" aria-hidden="true">
              <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                <span className="w-10 border-t-[0.1rem] border-zinc-300" />
                OR
                <span className="w-10 border-t-[0.1rem] border-zinc-300" />
              </div>
            </Columns.Column>
            <Columns.Column>
              <Link to="/join/">
                One of my crazy friends wrote a secret code on my hand... I wanna play!
              </Link>
            </Columns.Column>
            <Columns.Column size={1} touch={{ display: "hidden" }}>&nbsp;</Columns.Column>
          </Columns>

          <AnimatePresence>
            <Routes>
              <Route path="/new/" Component={NewParty} />
              <Route path="/join/" Component={JoinParty} />
              <Route path="/profile/*" Component={MyProfile} />
              <Route path="/rolled/:code" Component={RolledDialog} />
            </Routes>
          </AnimatePresence>

        </Container>
      </Hero.Body>
      <Hero.Footer>
        <Footer noHome profileAsLink>
          <UnsplashCredit id="h2O_jHvjfIM" name="Joanna Kosinska" username="joannakosinska" />
        </Footer>
      </Hero.Footer>
    </Hero>

  )
}
