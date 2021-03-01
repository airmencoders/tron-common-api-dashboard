import React, { FunctionComponent } from 'react';
import { PersonContext } from '../../context/PersonProviderContext';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageFormat from '../PageFormat/PageFormat';
import { PersonDto } from '../../openapi';

export const PersonControl: FunctionComponent = () => {

  var context = React.useContext(PersonContext);
  const [show, setShow] = React.useState(false);

  const addUser = async () => {
    try {
      await context.addUser({ email: 'billy@test.com' });
      console.log("Done!")
    }
    catch (e) { console.log(e) }
  }

  const handleClose = () => setShow(false);
  const handleSave = () => setShow(false);

  return (
    <PageFormat pageTitle={"Person"}>
      <Container fluid>
        <Row>
          <Col className={"text-left align-self-start"}>
            <Button className={"my-4"} variant="outline-primary" onClick={() => setShow(true)}>Add Person</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>UUID</th>
                  <th>First</th>
                  <th>Last</th>
                  <th>Title</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {context?.users.map((x: PersonDto) =>
                  <tr key={x.id} data-testid={x.id}>
                    <td>{x.id}</td>
                    <td>{x.firstName}</td>
                    <td>{x.lastName}</td>
                    <td>{x.title}</td>
                    <td>{x.email}</td>
                    <td>

                    </td>
                  </tr>)}
              </tbody>
            </Table>
          </Col>
        </Row>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>New Person</Modal.Title>
          </Modal.Header>
          <Modal.Body>Woohoo, you're reading this text in a modal!

                        </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
                    </Button>
            <Button variant="primary" onClick={handleSave}>
              Save
                    </Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </PageFormat>
  )
}
