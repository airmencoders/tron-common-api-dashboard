import React, { Component } from 'react';
import Button from '../Button/Button';
import { ErrorBoundaryProps } from './ErrorBoundaryProps';
import { ErrorBoundaryState } from './ErrorBoundaryState';

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  reloadPage() {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          Something unexpected happened. Try to{' '}
          <Button type="button" unstyled disableMobileFullWidth onClick={this.reloadPage}>reload this page?</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;