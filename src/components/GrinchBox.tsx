import { motion } from 'framer-motion';
import React from 'react';
import { Card, Container, Content } from 'react-bulma-components';

import hiImg from "src/images/grinch.png";

type Props = {
  children?: React.ReactNode,
};

export const GrinchBox = ({ children }: Props) => (
  <Container textAlign="centered" className="grinch-box">
    <motion.div
      initial={{ opacity: 0.2, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
    >
      <Card>
        <Card.Content>
          <img src={hiImg.src} alt="Hi!" className="hi-img" width={250} />

          <Content>
            {children}
          </Content>
        </Card.Content>
      </Card>
    </motion.div>
  </Container>
);
