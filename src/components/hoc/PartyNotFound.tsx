import { Container, Content, Hero } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { UnsplashCredit } from "@/components/UnsplashCredit";
import { Footer } from "@/components/hoc/Footer";

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
            <a href="/" className={buttonVariants({ variant: "secondary", surface: "dark", pill: true })}>Go back to the Earth</a>
          </p>
        </Content>
      </Container>
    </Hero.Body>
    <Hero.Footer>
      <Footer>
        <UnsplashCredit id="Yj1M5riCKk4" name="NASA" username="nasa" />
      </Footer>
    </Hero.Footer>
  </Hero>
);
