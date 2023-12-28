import { Container, Content, Hero } from "react-bulma-components";
import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Footer } from "src/components/hoc/Footer";

export const PartyNotFound = () => (
  <Hero size={"fullheight"} className="party-not-found">
    <Hero.Body>
      <Container>
        <Content>
          <h1>
            &mdash; Houston, we have a problem! There's no party here!<br />I
            repeat, code FOUR-OH-FOUR... FOXTROT-UNIFORM-CHARLIE-KILO...
          </h1>
          <p>
            <a href="/" className={"button is-medium is-white is-outlined"}>Go back to the Earth</a>
          </p>
        </Content>
      </Container>
    </Hero.Body>
    <Hero.Footer>
      <Footer>
        <UnsplashCredit nickname="nasa" name="NASA" />
      </Footer>
    </Hero.Footer>
  </Hero>
);
