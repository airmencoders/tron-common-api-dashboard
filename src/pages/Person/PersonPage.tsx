import React from 'react';
import PageFormat from '../../components/PageFormat/PageFormat';
import {Container} from 'react-bootstrap';

function PersonPage() {
  return (
      <PageFormat className="person-page" pageTitle="Person Data">
        <Container fluid style={{height: '100%'}}>

        </Container>
      </PageFormat>
  );
}

export default PersonPage;
