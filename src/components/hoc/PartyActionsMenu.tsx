import { Menu } from "@base-ui/react/menu";
import { Link2, Mail, Menu as MenuIcon, Trash2 } from 'react-feather';
import { Route, Routes, useNavigate } from 'react-router-dom';

import { Button } from "@/components/ui/button";
import { menuItemClass, menuItemDestructiveClass, menuPopupClass, menuPositionerClass } from "@/components/ui/menu";
import { cn } from "@/lib/utils";
import { ConfirmPartyDelete } from '@/components/hoc/ConfirmPartyDelete';
import { InvitePartyDialog } from '@/components/hoc/InvitePartyDialog';
import { usePartyContext } from '@/components/hoc/PartyContext';
import { useCopyPartyLink } from '@/components/hooks';

/**
 * The host's other actions, in a ☰ menu beside the roll-the-dice button: copy the party's link, invite people by
 * email (./invite), and delete the party (confirmed at ./delete).
 */
export const PartyActionsMenu = () => {
  const { party } = usePartyContext();
  const navigate = useNavigate();
  const copyLink = useCopyPartyLink(party ?? { code: "", isProtected: false });

  return (
    <>
      <Menu.Root>
        <Menu.Trigger render={<Button variant="ghost" className="size-10 px-0 align-middle" aria-label="More actions" title="More actions" />}>
          <MenuIcon size={20} aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="top" align="start" sideOffset={8} collisionPadding={16} className={menuPositionerClass}>
            <Menu.Popup className={menuPopupClass}>
              <Menu.Item className={menuItemClass} onClick={copyLink}>
                <Link2 size={16} aria-hidden="true" /> Copy link
              </Menu.Item>
              <Menu.Item className={menuItemClass} onClick={() => navigate('invite')}>
                <Mail size={16} aria-hidden="true" /> Invite by email…
              </Menu.Item>
              <Menu.Separator className="my-1 h-px bg-border" />
              <Menu.Item className={cn(menuItemClass, menuItemDestructiveClass)} onClick={() => navigate('delete')}>
                <Trash2 size={16} aria-hidden="true" /> Delete this party
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <Routes>
        <Route path="invite" Component={InvitePartyDialog} />
        <Route path="delete" Component={ConfirmPartyDelete} />
      </Routes>
    </>
  );
};
