import { render, screen } from '@testing-library/react';
import { LoggedIn } from './LoggedIn';

describe('LoggedIn', () => {
  it('renders nothing when logged out', () => {
    render(<LoggedIn loginState="loggedOut" userUid="" currentEmail="" />);
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('renders user info and logout button when logged in', () => {
    render(<LoggedIn loginState="loggedIn" userUid="123" currentEmail="test@example.com" />);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
