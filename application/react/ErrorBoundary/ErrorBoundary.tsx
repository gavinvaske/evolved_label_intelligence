import React, { Component, ReactNode } from "react";
import styles from './ErrorBoundary.module.scss'

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    // Update state so the next render shows the fallback UI.      
    return { hasError: true };
  }

  override componentDidCatch(error: Error, _: React.ErrorInfo) {
    console.error("Error Message:", error.message);
    console.error("Error stack:", error.stack);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorBoundaryContainer}>
          <h2>Something went wrong. See browser logs for more details.</h2>
        </div>
      );
    }
    return this.props.children;

  }
}

export default ErrorBoundary;