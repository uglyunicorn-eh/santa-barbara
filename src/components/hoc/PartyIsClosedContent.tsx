import type { Party, User } from '@/types';

type Props = {
  party: Party;
  user: User;
}

export const PartyIsClosedContent = ({ party, user }: Props) => {
  return (
    <>
      <p>
        Hey, {user.name}! This is a new stage of the <strong>{party.name.replace(/!+$/, '')}</strong>!
        You are officially an Anonymous Ded Moroz! Hooray! &#x1F389;
      </p>
      <p>
        {party.participantCount} awesome people are participating in this. Our very special elf finished his
        complex math and you know what? Each of you got one name. This is a person you have to get a gift to.
      </p>
      <p>
        Just ask the Gnomik, but keep the name a secret: nobody else should know who it is.
      </p>
      <p>
        Have fun! And Happy Holidays!
      </p>
    </>
  );
}
