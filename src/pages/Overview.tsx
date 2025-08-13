import { useState, useEffect } from 'react';
import { getAllGiftcards, getCurrentUser } from '../firestore';
import { store } from '../App';
import styled from 'styled-components';
import { GetAllGiftcardsReturnProps } from '../types';

const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StatCard = styled.div`
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 4px;
`;

const StatTitle = styled.h2`
  margin: 0 0 10px 0;
`;

const StatValue = styled.p`
  margin: 0;
  font-size: 24px;
  font-weight: bold;
`;

const RecentlyExpiredList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RecentlyExpiredListItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ccc;
`;

export const Overview = () => {
  const [giftcards, setGiftcards] = useState<GetAllGiftcardsReturnProps>();
  const [userInfo, setUserInfo] = useState<any>();
  const [user] = store.useState("user");

  useEffect(() => {
    const fetchData = async () => {
      if (user.currentUid) {
        const userGiftcards = await getAllGiftcards(user.currentUid, user.currentEmail);
        setGiftcards(userGiftcards);
        const userInfo = await getCurrentUser(user.currentUid);
        setUserInfo(userInfo);
      }
    };
    fetchData();
  }, [user]);

  const activeGiftcards = giftcards?.default || [];
  const totalActiveValue = activeGiftcards.reduce((total, card) => total + card.amount, 0);

  const recentlyExpired = giftcards?.expired.slice(0, 5) || [];

  return (
    <OverviewContainer>
      <h1>Overzicht</h1>
      <StatCard>
        <StatTitle>Actieve Cadeaubonnen</StatTitle>
        <StatValue>{activeGiftcards.length}</StatValue>
      </StatCard>
      <StatCard>
        <StatTitle>Totaal Waarde Actief</StatTitle>
        <StatValue>€{totalActiveValue.toFixed(2)}</StatValue>
      </StatCard>
      <StatCard>
        <StatTitle>Recent Verlopen</StatTitle>
        <RecentlyExpiredList>
          {recentlyExpired.map((card) => (
            <RecentlyExpiredListItem key={card.id}>
              <span>{card.name}</span>
              <span>€{card.amount.toFixed(2)}</span>
            </RecentlyExpiredListItem>
          ))}
        </RecentlyExpiredList>
      </StatCard>
    </OverviewContainer>
  );
};
