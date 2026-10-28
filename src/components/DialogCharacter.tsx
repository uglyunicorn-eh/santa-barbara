import React from "react";

import { Columns, Content } from "@/components/layout";

/**
 * A dialog's character beside its text (docs/ui-kit.md, "Tones"): Santa raising a glass when you leave, the Grinch on
 * the deletes. The character hides on phones, where the text takes the sheet's width.
 */
export const DialogCharacter = ({ image, children }: { image: React.ImgHTMLAttributes<HTMLImageElement>, children: React.ReactNode }) => (
  <Columns vCentered>
    <Columns.Column narrow mobile={{ display: 'hidden' }} className="tablet:flex">
      <img alt="" {...image} />
    </Columns.Column>
    <Columns.Column>
      <Content>
        {children}
      </Content>
    </Columns.Column>
  </Columns>
);
