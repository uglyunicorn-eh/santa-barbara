import { Button, Container, Hero } from "react-bulma-components";

import { UnsplashCredit } from "src/components/UnsplashCredit";
import { Footer } from "src/components/hoc/Footer";

import "src/styles/login.scss";

export const LoginBox = () => {
  return (
    <Hero size={"fullheight"} className="login-container has-dark-background">
      <Hero.Body>
        <Container textAlign="centered">
          <Button
            // isLink={true}
            size="medium"
            className="is-rounded is-link login-button"
            // isLoading={this.state.isBusy}
            // onClick={onLoginClick}
            // disabled={this.state.isBusy || !this.props.isFacebookApiReady}
            style={{ backgroundColor: '#e94e59' }}
          >
            Enter with your email address
          </Button>
        </Container>
      </Hero.Body>

      <Hero.Footer>
        <Footer>
          <UnsplashCredit nickname="callmefred" name="Frederick Tubiermont" />
        </Footer>
      </Hero.Footer>
    </Hero>
  );
};
