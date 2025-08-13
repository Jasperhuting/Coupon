import { render, screen, waitFor } from '@testing-library/react';
import { Overview } from './Overview';
import * as firestore from '../firestore';
import { store } from '../App';

jest.mock('../firestore');

const mockGiftcards = {
  default: [
    { id: '1', name: 'Card 1', amount: 50, status: 'NEW' },
    { id: '2', name: 'Card 2', amount: 100, status: 'NEW' },
  ],
  expired: [
    { id: '3', name: 'Card 3', amount: 25, status: 'EXPIRED' },
  ],
  used: [],
  deleted: [],
  amount: 3,
  totalAmount: 175,
  allData: [],
  new: [],
};

describe('Overview', () => {
  beforeEach(() => {
    store.setState("user", { currentEmail: 'test@example.com', currentUid: '123' });
    (firestore.getAllGiftcards as jest.Mock).mockResolvedValue(mockGiftcards);
    (firestore.getCurrentUser as jest.Mock).mockResolvedValue({ hideDeleted: false, hideExpired: false });
  });

  it('renders overview statistics', async () => {
    render(<Overview />);

    await waitFor(() => {
      expect(screen.getByText('Actieve Cadeaubonnen')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Totaal Waarde Actief')).toBeInTheDocument();
      expect(screen.getByText('€150.00')).toBeInTheDocument();
      expect(screen.getByText('Recent Verlopen')).toBeInTheDocument();
      expect(screen.getByText('Card 3')).toBeInTheDocument();
    });
  });
});
