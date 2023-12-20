import { Hero } from "react-bulma-components";
import { BarLoader } from 'react-spinners';


export const AppSpinner = () => (
  <Hero size={"fullheight"} className="app-spinner">
    <Hero.Body>
      <span
        style={{
          border: '1px solid rgba(255, 255, 255, 0.9)',
          padding: 2,
          borderRadius: 4,
        }}
      >
        <BarLoader
          color="white"
          height={5}
          width={200}
        />
      </span>
    </Hero.Body>
  </Hero>
);
