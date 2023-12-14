import Bulma from "react-bulma-components";

import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Divider } from "src/components/Divider";
import { Footer } from "src/components/hoc/Footer";

import grinchImg from "public/grinch.png";
import "src/styles/welcome.scss";

export const WelcomeBox = () => {
  return (
    <Bulma.Hero size={"fullheight"} className="welcome-page">
      <Bulma.Hero.Header>
        <Bulma.Container>
          <Bulma.Columns vCentered>
            <Bulma.Columns.Column tablet={{ display: "hidden" }} textAlign="centered">
              <img src={grinchImg.src} alt="Grinch" width={128} height={128} />
            </Bulma.Columns.Column>
            <Bulma.Columns.Column mobile={{ display: "hidden" }}>&nbsp;</Bulma.Columns.Column>
            <Bulma.Columns.Column size="one-third" className="has-text-right-tablet has-text-centered-mobile">
              <h1>
                Welcome to the Anonymous Ded Morozes!
              </h1>
            </Bulma.Columns.Column>
            <Bulma.Columns.Column mobile={{ display: "hidden" }} narrow>
              <img src={grinchImg.src} style={{ marginBottom: -40 }} alt="Grinch" />
            </Bulma.Columns.Column>
          </Bulma.Columns>

        </Bulma.Container>
      </Bulma.Hero.Header>

      <Bulma.Hero.Body>
        <Bulma.Container>

          <Bulma.Content textAlign="centered">
            &mdash; So, what are you up to today, my friend?
          </Bulma.Content>

          <Bulma.Columns vCentered>
            <Bulma.Columns.Column size={1} touch={{ display: "hidden" }}>&nbsp;</Bulma.Columns.Column>
            <Bulma.Columns.Column className="has-text-right-tablet">
              <a href="/p/new">
                I wanna start playing this weird game with my soulmates... Let's rock'n'roll!
              </a>
            </Bulma.Columns.Column>
            <Bulma.Columns.Column narrow textAlign="centered" mobile={{ display: "hidden" }}>
              <Divider vertical={true} label="OR" />
            </Bulma.Columns.Column>
            <Bulma.Columns.Column>
              <a href="/p/join">
                One of my crazy friend wrote a secret code on my hand... I wanna play!
              </a>
            </Bulma.Columns.Column>
            <Bulma.Columns.Column size={1} touch={{ display: "hidden" }}>&nbsp;</Bulma.Columns.Column>
          </Bulma.Columns>


        </Bulma.Container>
      </Bulma.Hero.Body>
      <Bulma.Hero.Footer>
        <Footer>
          <UnsplashCredit nickname="joannakosinska" name="Joanna Kosinska" />
        </Footer>
      </Bulma.Hero.Footer>
    </Bulma.Hero>
  )
}
