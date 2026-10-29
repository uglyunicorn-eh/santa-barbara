import { Menu } from "@base-ui/react/menu";
import React from "react";
import { Menu as MenuIcon } from "react-feather";
import { Link } from "react-router-dom";

import type { MenuItem } from "@/components/hoc/Footer";
import { menuGroups, moreTriggerClass } from "@/components/hoc/footerMenu";
import { menuItemClass, menuPopupClass, menuPositionerClass, menuSeparatorClass } from "@/components/ui/menu";

/** The footer's other links in a small menu that opens upwards. */
export const MoreMenu = ({ items, dot = false, defaultOpen = false }: { items: MenuItem[]; dot?: boolean; defaultOpen?: boolean }) => (
  // `defaultOpen`: mounted by the click on the look-alike button (Footer), so it opens straight away.
  <Menu.Root defaultOpen={defaultOpen}>
    <Menu.Trigger className={`${moreTriggerClass} relative`} aria-label={dot ? "More links, with parties to reveal" : "More links"} title="More links">
      <MenuIcon size={18} aria-hidden="true" />
      {/* "My Profile" inside has a dot: show it here too. */}
      {dot && <span aria-hidden="true" className="absolute -top-0.5 -right-1 size-2 rounded-full bg-red-500" />}
    </Menu.Trigger>
    <Menu.Portal>
      <Menu.Positioner side="top" align="center" sideOffset={8} collisionPadding={16} className={menuPositionerClass}>
        <Menu.Popup className={menuPopupClass}>
          {menuGroups(items).map((group, index) => (
            <React.Fragment key={group[0].key}>
              {index > 0 && <Menu.Separator className={menuSeparatorClass} />}
              {group.map(({ key, url, label, menuLabel, asLink, onClick, title: _title, ...rest }) => (
                asLink
                  ? <Menu.LinkItem key={key} className={menuItemClass} closeOnClick render={<Link to={url} />}>{menuLabel ?? label}</Menu.LinkItem>
                  : <Menu.LinkItem key={key} className={menuItemClass} closeOnClick href={url} onClick={onClick} {...rest}>{menuLabel ?? label}</Menu.LinkItem>
              ))}
            </React.Fragment>
          ))}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>
);
