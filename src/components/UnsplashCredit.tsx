import { type UnsplashPhoto, unsplashPhotos, unsplashPhotoUrl, unsplashProfileUrl } from "src/unsplashPhotos";

type Props = {
  photo: UnsplashPhoto;
};

export const UnsplashCredit = ({ photo }: Props) => {
  const { id, name, username } = unsplashPhotos[photo];
  return (
    <div className={"unsplash-credit"}>
      <>Photo by </>
      <a href={unsplashProfileUrl(username)} target="_blank" rel="noopener noreferrer">{name}</a>
      <> on </>
      <a href={unsplashPhotoUrl(id)} target="_blank" rel="noopener noreferrer">Unsplash</a>
    </div>
  );
};
