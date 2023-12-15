import React from "react";
import { AnimatePresence, motion, type ResolvedValues } from "framer-motion";

import "src/styles/garage.scss";

type Props = {
  locked?: boolean;
  doorElement?: React.ReactNode;
  children?: React.ReactNode;
}

const variants = {
  closed: {
    top: 0,
  },
  open: {
    top: '-105vh',
  },
};

export const GarageDoor = ({ locked, doorElement, children }: Props) => {
  const [shut, setShut] = React.useState(locked);

  const door = React.useMemo(() => doorElement ?? <div />, [doorElement]);

  const onUpdate = React.useCallback(
    ({ top }: ResolvedValues) => {
      setShut(top === 0);
    },
    [],
  );

  return (
    <>
      <AnimatePresence>
        {locked && (
          <motion.div
            className="garage-door"
            variants={variants}
            initial={shut ? "closed" : "open"}
            animate={locked ? "closed" : "open"}
            exit="open"
            transition={{ duration: 1 }}
            onUpdate={onUpdate}
          >
            {door}
          </motion.div>
        )}
      </AnimatePresence>
      {!shut && <div className="garage-door-content">{children}</div>}
    </>
  );
};
