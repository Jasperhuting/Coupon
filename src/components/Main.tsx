import styled from 'styled-components/macro';
import { InformationBar } from './InformationBar';
import { GiftcardTable } from './GiftcardTable';
import { GetAllGiftcardsReturnProps } from '../types';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 40px);
  max-width: 1024px;
  padding: 20px;
  box-sizing: border-box;
  background-color: white;
  border-radius: 4px;
`;

export const Main = ({
  giftcards,
  userInfo,
  getGiftcards,
}: {
  giftcards: GetAllGiftcardsReturnProps;
  userInfo: any;
  getGiftcards: () => void;
}) => {
  return (
    <>
      <Content>
        {giftcards && (
          <>
            <InformationBar
              userInfo={userInfo}
              amountGiftcards={giftcards.amount}
              totalAmount={giftcards.totalAmount}
              triggerReload={() => getGiftcards()}
            />
            <GiftcardTable
              userInfo={userInfo}
              expiredGiftcards={giftcards.expired}
              usedGiftcards={giftcards.used}
              deletedGiftcards={giftcards.deleted}
              amountGiftcards={giftcards.amount}
              newGiftcards={giftcards.new}
              totalAmount={giftcards.totalAmount}
              allData={giftcards.allData}
              triggerReload={() => getGiftcards()}
              defaultGiftcards={giftcards.default}
            ></GiftcardTable>
          </>
        )}
      </Content>
    </>
  );
};
