type Props = {
  name?: string;
  nickname: string;
};

export const UnsplashCredit = ({ name, nickname }: Props) => (
  <div className={"unsplash-credit"}>
    <>Photo by </>
    <a href={`https://unsplash.com/@${nickname}?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText`} target="_blank" rel="noopener noreferrer">
      {name || nickname}
    </a>
    <> on </>
    <a href={`https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText`} target="_blank" rel="noopener noreferrer">Unsplash</a>
  </div>
)
