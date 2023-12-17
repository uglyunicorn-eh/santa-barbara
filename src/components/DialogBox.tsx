import type { FormikConfig, FormikValues } from "formik";
import { motion } from "framer-motion";
import React from "react";
import { Button, Modal } from "react-bulma-components";
import DocumentMeta from "react-document-meta";
import { useNavigate } from "react-router-dom";
import { Form } from "src/components/forms";

type Props<Values extends FormikValues> = {
  title?: string;
  dismissLocation?: string;
  action?: React.ReactNode,
  className?: string;
  children?: React.ReactNode;
  form?: FormikConfig<Values>;
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

export const DialogBox = <Values extends FormikValues = FormikValues>({
  title,
  dismissLocation = "/",
  className,
  action,
  children,
  form,
}: Props<Values>) => {
  const navigate = useNavigate();

  const onClose = React.useCallback(
    () => {
      navigate(dismissLocation);
    },
    [
      navigate,
      dismissLocation,
    ],
  );

  const modalCard = React.useMemo(
    () => (
      <Modal.Card>
        <Modal.Card.Header>
          {title}
        </Modal.Card.Header>
        <Modal.Card.Body>
          {children}
        </Modal.Card.Body>
        <Modal.Card.Footer>
          <Button onClick={onClose}>Nah, never mind</Button>
          {action}
        </Modal.Card.Footer>
      </Modal.Card>
    ),
    [
      title,
      children,
      onClose,
      action,
    ],
  );

  const modalContent = React.useMemo(
    () => form ? <Form {...form}>{modalCard}</Form> : modalCard,
    [
      form,
      modalCard,
    ],
  );

  const defaultMotionProps = React.useMemo(
    () => ({
      initial: "hidden",
      animate: "visible",
      exit: "hidden",
      transition: { duration: 0.15 },
    }),
    [],
  );

  return (
    <DocumentMeta title={title}>
      <Modal show onClose={onClose} className={className}>
        <motion.div className="modal-background-custom" variants={BackgroundVariants} {...defaultMotionProps} />

        <motion.div className="modal-card-wrapper" variants={CardVariants} {...defaultMotionProps} >
          {modalContent}
        </motion.div>

      </Modal>
    </DocumentMeta>
  );
};
