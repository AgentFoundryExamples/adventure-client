import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';

describe('AppLayout', () => {
  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('App')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders the main outlet container', () => {
    const { container } = render(
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    );

    const mainElement = container.querySelector('.app-main');
    expect(mainElement).toBeInTheDocument();
  });
});
