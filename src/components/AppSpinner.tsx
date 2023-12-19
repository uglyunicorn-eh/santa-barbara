import { Hero } from "react-bulma-components";
import { BarLoader } from 'react-spinners';


export const AppSpinner = () => (
  <Hero size={"fullheight"} className="app-spinner">
    <Hero.Body>
      <BarLoader color="#e94e59" />
    </Hero.Body>
  </Hero>
);
