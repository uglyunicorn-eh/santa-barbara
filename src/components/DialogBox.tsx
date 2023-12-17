import { Formik, useFormikContext, type FormikConfig, type FormikValues } from "formik";
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

const DismissButton = ({ dismissLocation }: { dismissLocation: string }) => {
  const { isSubmitting } = useFormikContext();

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

  return (
    <Button onClick={onClose} disabled={isSubmitting}>Nah, never mind</Button>
  );
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
          <DismissButton dismissLocation={dismissLocation} />
          {action}
        </Modal.Card.Footer>
      </Modal.Card>
    ),
    [
      title,
      children,
      dismissLocation,
      action,
    ],
  );

  const void0 = React.useCallback(() => void 0, []);

  const modalContent = React.useMemo(
    () => (
      form
        ? <Form {...form}>{modalCard}</Form>
        : <Formik onSubmit={void0} initialValues={{}}>{modalCard}</Formik>
    ),
    [
      form,
      modalCard,
      void0,
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
