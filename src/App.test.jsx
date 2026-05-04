import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Personal Stylist Studio/i);
  expect(titleElement).toBeDefined();
});

test('renders form labels', () => {
  render(<App />);
  expect(screen.getByText(/전신 사진 업로드/i)).toBeDefined();
  expect(screen.getByText(/키 \(cm\)/i)).toBeDefined();
  expect(screen.getByText(/몸무게 \(kg\)/i)).toBeDefined();
});
