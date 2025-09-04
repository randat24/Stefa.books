import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toHaveAttribute(attr: string, value?: string): R;
      toBeEmptyDOMElement(): R;
      toBeDisabled(): R;
      toHaveFocus(): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
    }
  }
}