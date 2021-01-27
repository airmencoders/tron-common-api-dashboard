import React, { FC, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useHealthState } from '../state/health/health-state';
import PageFormat from '../components/PageFormat/PageFormat';

export const HealthPage: FC = () => {
    const state = useHealthState();

    useEffect(() => {
        state.fetchAndStoreHealthStatus();
    }, []);

    return (
        <PageFormat pageTitle={"Health"}>
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
        </PageFormat>

    )
}