type Props = {
  /** Unsplash photo ID, the last part of the photo page URL. */
  id: string;
  name: string;
  username: string;
};

// Unsplash asks for links back to it to name the referring site.
const referral = "utm_source=gnomik.me&utm_medium=referral";

/** Credit line in the format Unsplash's attribution guideline recommends. */
export const UnsplashCredit = ({ id, name, username }: Props) => (
  <div className={"unsplash-credit"}>
    <>Photo by </>
    <a href={`https://unsplash.com/@${username}?${referral}`} target="_blank" rel="noopener noreferrer">{name}</a>
    <> on </>
    <a href={`https://unsplash.com/photos/${id}?${referral}`} target="_blank" rel="noopener noreferrer">Unsplash</a>
  </div>
);
