import React from 'react';
import { Menu } from "@base-ui/react/menu";
import { Menu as MenuIcon } from 'react-feather';
import { Route, Routes, useNavigate } from 'react-router-dom';

import { Button } from "@/components/ui/button";
import { menuItemClass, menuItemDestructiveClass, menuPopupClass, menuPositionerClass } from "@/components/ui/menu";
import { cn } from "@/lib/utils";
import { ConfirmPartyDelete } from 'src/components/hoc/ConfirmPartyDelete';

/** The host's other actions, in a ☰ menu beside the roll-the-dice button: for now, deleting the party (confirmed at ./delete). */
export const DeletePartyLink = () => {
  const navigate = useNavigate();
  const onDelete = React.useCallback(() => navigate('delete'), [navigate]);

  return (
    <>
      <Menu.Root>
        <Menu.Trigger render={<Button variant="ghost" className="size-10 px-0 align-middle" aria-label="More actions" title="More actions" />}>
          <MenuIcon size={20} aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="top" align="start" sideOffset={8} collisionPadding={16} className={menuPositionerClass}>
            <Menu.Popup className={menuPopupClass}>
              <Menu.Item className={cn(menuItemClass, menuItemDestructiveClass)} onClick={onDelete}>
                Delete this party
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <Routes>
        <Route path="delete" Component={ConfirmPartyDelete} />
      </Routes>
    </>
  );
};
