import { Hero } from "react-bulma-components";
import { BarLoader } from 'react-spinners';


export const AppSpinner = () => (
  <Hero size={"fullheight"} className="app-spinner">
    <Hero.Body>
      <span
        style={{
          border: '1px solid rgba(255, 255, 255, 0.9)',
          padding: 2,
          borderRadius: 6,
          background: '#141414',
        }}
      >
        <BarLoader
          color="#f7d6a2"
          height={6}
          width={200}
        />
      </span>
    </Hero.Body>
  </Hero>
);
