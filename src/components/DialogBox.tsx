import { motion } from "framer-motion";
import React from "react";
import { Button, Modal } from "react-bulma-components";
import { useNavigate } from "react-router-dom";

import "src/styles/dialog.scss";

type Props = {
  title?: string;
  dismissLocation?: string;
  className?: string;
  children?: React.ReactNode;
};

export const BackgroundVariants = {
  visible: {
    opacity: 1,
  },
  hidden: {
    opacity: 0,
  },
};

export const CardVariants = {
  visible: {
    scale: 1,
    opacity: 1,
  },
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
}

export const DialogBox = ({
  title,
  dismissLocation = "/",
  className,
  children,
}: Props) => {
  const navigate = useNavigate();

  const onClose = React.useCallback(
    () => {
      navigate(dismissLocation);
    }, [
    navigate,
    dismissLocation,
  ]);

  return (
    <Modal show onClose={onClose} className={className}>
      <motion.div
        className="modal-background-custom"
        variants={BackgroundVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.15 }}
      />
      <motion.div
        className="modal-card-wrapper"
        variants={CardVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.15 }}
      >
        <Modal.Card>
          <Modal.Card.Header>
            {title}
          </Modal.Card.Header>
          <Modal.Card.Body>
            {children}
          </Modal.Card.Body>
          <Modal.Card.Footer>
            <Button onClick={onClose}>Nah, never mind</Button>
          </Modal.Card.Footer>
        </Modal.Card>
      </motion.div>
    </Modal>
  );
};
