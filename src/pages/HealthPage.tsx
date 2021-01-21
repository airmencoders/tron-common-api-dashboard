import * as React from 'react';
import Container from 'react-bootstrap/esm/Container';
import { useHealthState } from '../state/health-state';

export const HealthPage: React.FC = () => {
    const state = useHealthState();

    React.useEffect(() => {
        state.fetchAndStoreHealthStatus();
    }, []);

    if (state.isPromised) {
        return (
            <Container fluid>
                <p>Loading...</p>
            </Container>
        )
    }

    return (
        <Container fluid>
            <h1>Health Page</h1>
            <p>System Status: {state.systemStatus}</p>
        </Container>
    )
}