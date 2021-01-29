import React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import StatusGoodIcon from '../../icons/StatusGoodIcon';
import {Meta} from '@storybook/react';
import RemoveIcon from '../../icons/RemoveIcon';
import CloseIcon from '../../icons/CloseIcon';
import WarningIcon from '../../icons/WarningIcon';

export const IconList = () => (
    <Container>
      <Row>
        <Col>
          <StatusGoodIcon  size={4}/>
          <h6>StatusGoodIcon</h6>
        </Col>
        <Col>
          <RemoveIcon size={4}/>
          <h6>RemoveIcon</h6>
        </Col>
        <Col>
          <CloseIcon size={4}/>
          <h6>CloseIcon</h6>
        </Col>
        <Col>
          <WarningIcon size={4} />
          <h6>WarningIcon</h6>
        </Col>
      </Row>
    </Container>
);

export default {
  title: 'Icons/IconList',
  component: IconList
} as Meta;
