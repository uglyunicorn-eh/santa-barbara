import React from "react";
import { ArrowDown, BookOpen, EyeOff, Gift, Mail, Users } from "react-feather";

import { Container, Hero } from "@/components/layout";
import { buttonVariants } from "@/components/ui/button";
import { SITE_NAME, TAGLINE } from "@/site";

// Optional only for index.astro, whose named slots arrive as these props without TypeScript seeing them.
type Props = {
  /** The Enter button in the hero: the app's (it opens the sign-in dialog), or a plain link in the static page. */
  enter?: React.ReactNode;
  /** The Enter button again, at the end of the page, with a livelier label. */
  enterAgain?: React.ReactNode;
  footer?: React.ReactNode;
};

const STEPS = [
  {
    image: "/santa-1.webp",
    title: "Sign in with a magic link",
    text: "Type your email address and click the link our elves send you. No passwords to forget.",
  },
  {
    image: "/santa-2.webp",
    title: "Host or join a party",
    text: "A host gets a secret code to share. Friends type it in, and they're on the list.",
  },
  {
    image: "/santa-3.webp",
    title: "Roll the dice",
    text: "Everyone gets one name: the person they give a gift to. Nobody else sees it.",
  },
];

const FEATURES = [
  { icon: Gift, title: "Free, with no ads", text: "No premium elves, no upsells, no banners. Just Secret Santa." },
  { icon: Mail, title: "No passwords, no spam", text: "A magic link to sign in, and not a single newsletter. Ever." },
  { icon: Users, title: "Any number of people", text: "Three, seven or forty-one. Odd numbers work too: nobody needs a pair." },
  { icon: EyeOff, title: "Truly secret", text: "You see only your own name. Nobody can peek at who got whom, not even the host." },
];

/** The elf in two sizes; its slot (landing.css) is 500px wide, down to 230px on phones. index.astro preloads the same. */
export const ELF_SRCSET = "/elf-2-410.webp 410w, /elf-2.webp 512w";
export const ELF_SIZES = "(max-width: 768px) 230px, (max-width: 899px) 320px, (max-width: 1099px) 400px, 500px";

/** The step stickers' slot (landing.css): 200px wide, 128px on phones. Each comes at 256 and 400px. */
const STEP_SIZES = "(max-width: 768px) 128px, 200px";

const howItWorksClass = buttonVariants({ variant: "secondary", size: "lg", surface: "dark", pill: true });

/**
 * The front door for anyone signed out: a hero over the HO HO HO photo, then what the site is and why it's nice.
 * No hooks, so the home page can also render it as static HTML for search engines (index.astro), and the app shows the
 * same page once it loads (LoginBox).
 */
export const Landing = ({ enter, enterAgain, footer }: Props) => (
  <div className="landing">
    <div className="landing-main">
      {/* The HO HO HO photo, holding still while the hero scrolls off it and the sections slide over it. */}
      <div className="landing-backdrop" aria-hidden="true"><div /></div>
      <Hero size="fullheight" className="login-container landing-hero">
        <Hero.Body>
          <Container textAlign="centered">
            <div className="landing-card">
              <img
                className="landing-logo"
                src="/elf-2.webp"
                srcSet={ELF_SRCSET}
                sizes={ELF_SIZES}
                alt=""
                width={512}
                height={512}
                fetchPriority="high"
              />
              <div className="landing-card-text">
                <h1>{SITE_NAME}</h1>
                <p className="landing-tagline">{TAGLINE}</p>
                <div className="landing-actions">
                  {enter}
                  <a href="/how-it-works/" className={howItWorksClass}>
                    <BookOpen size={20} aria-hidden="true" />
                    How it works
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </Hero.Body>
        <Hero.Footer>
          <a href="#about" className="landing-more">
            What's this all about?
            <ArrowDown size={18} aria-hidden="true" />
          </a>
        </Hero.Footer>
      </Hero>

      <section id="about" className="landing-section">
        <Container>
          <p className="landing-eyebrow">How it works</p>
          <h2>Three steps. Zero spreadsheets.</h2>
          <ol className="landing-steps">
            {STEPS.map(({ image, title, text }, index) => (
              <li key={title}>
                <img src={image} srcSet={`${image.replace(".webp", "-256.webp")} 256w, ${image} 400w`} sizes={STEP_SIZES} alt="" width={400} height={400} loading="lazy" />
                <span className="landing-step-number">{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="landing-section">
        <Container>
          <p className="landing-eyebrow">Why people like it</p>
          <h2>Secret Santa, minus the hassle</h2>
          <ul className="landing-features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon size={26} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </div>

    {/* Pinned to the bottom under the rest of the page, which slides up off it. */}
    <div className="landing-reveal">
      <section className="landing-section landing-final">
        <Container textAlign="centered">
          <h2>Ready, weirdo?</h2>
          <p>Gather your gang, roll the dice and keep the secret. It takes a minute.</p>
          <div className="landing-actions">
            <div className="landing-party-bezel">{enterAgain}</div>
          </div>
        </Container>
      </section>

      {footer}
    </div>
  </div>
);
