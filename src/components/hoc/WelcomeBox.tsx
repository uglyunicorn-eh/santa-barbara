import { Columns, Container, Content, Hero } from "react-bulma-components";

import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Divider } from "src/components/Divider";
import { Footer } from "src/components/hoc/Footer";

import grinchImg from "src/images/grinch.png";
import "src/styles/welcome.scss";
import { Link } from "react-router-dom";
import { Route, Routes } from "react-router";


export const WelcomeBox = () => {
  return (
    <>
      <Hero size={"fullheight"} className="welcome-page">
        <Hero.Header>
          <Container>
            <Columns vCentered>
              <Columns.Column tablet={{ display: "hidden" }} textAlign="centered">
                <img src={grinchImg.src} alt="Grinch" width={128} height={128} />
              </Columns.Column>
              <Columns.Column mobile={{ display: "hidden" }}>&nbsp;</Columns.Column>
              <Columns.Column size="one-third" className="has-text-right-tablet has-text-centered-mobile">
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
              <Columns.Column className="has-text-right-tablet">
                <Link to="/p/new">
                  I wanna start playing this weird game with my soulmates... Let's rock'n'roll!
                </Link>
              </Columns.Column>
              <Columns.Column narrow textAlign="centered" mobile={{ display: "hidden" }}>
                <Divider vertical={true} label="OR" />
              </Columns.Column>
              <Columns.Column>
                <Link to="/p/join">
                  One of my crazy friend wrote a secret code on my hand... I wanna play!
                </Link>
              </Columns.Column>
              <Columns.Column size={1} touch={{ display: "hidden" }}>&nbsp;</Columns.Column>
            </Columns>

            <Routes>
              {/* <Route path="/p/new" element={StartPartyComponent} />
              <Route path="/p/join" element={JoinPartyComponent} /> */}
            </Routes>

          </Container>
        </Hero.Body>
        <Hero.Footer>
          <Footer>
            <UnsplashCredit nickname="joannakosinska" name="Joanna Kosinska" />
          </Footer>
        </Hero.Footer>
      </Hero>
    </>
  );
}
