export enum Status {
  NEW = 'NEW',
  DEFAULT = 'DEFAULT',
  USED = 'USED',
  DELETED = 'DELETED',
  EXPIRED = 'EXPIRED',
}


export type Giftcard = {
  name?: string;
  amount?: number;
  validDate?: string;
  owner?: string;
  status?: Status;
  id: string;
}

export type User = {
  uid: string;
  data: Giftcard[];
  email: string;
}

export type GetAllGiftcardsReturnProps = {
    default: Giftcard[],
    expired: Giftcard[],
    used: Giftcard[],
    new: Giftcard[],
    deleted: Giftcard[],
    amount: number,
    totalAmount: number,
    allData: Giftcard[],
}
