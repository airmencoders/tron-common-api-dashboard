import React, { FC, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import Container from 'react-bootstrap/esm/Container';
import { useHealthState } from '../state/health/health-state';

export const HealthPage: FC = () => {
    const state = useHealthState();

    useEffect(() => {
        state.fetchAndStoreHealthStatus();
    }, []);

    return (
        <Container fluid>
            {state.isPromised ?
                <Spinner animation="border" role="status" variant="primary">
                    <span className="sr-only">Loading...</span>
                </Spinner>
                :
                <div>
                    <h1>Health Page</h1>
                    <p>System Status: {state.systemStatus}</p>
                </div>
            }
        </Container>
    )
}