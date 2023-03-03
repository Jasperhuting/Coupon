import { store } from "App";
import { getAuth, signOut } from "firebase/auth";
import { addDoc, collection, getDocs, getFirestore, orderBy, query, where } from "firebase/firestore"
import { GetAllGiftcardsReturnProps, Giftcard, Status } from "types";
import db from '../db'


export const addGiftcardToDatabase = async (giftcard: Pick<Giftcard, 'amount' | 'name' | 'owner' | 'status' | 'validDate'>, ownerId: string) => {

    const firestore = getFirestore(db);
    
    // Add a new document with a generated id.
    const docRef = await addDoc(collection(firestore, "giftcards"), {
        ...giftcard,
        owner: ownerId,
        status: Status.NEW});
    console.log("Document written with ID: ", docRef);
    console.log("Document written with ID: ", docRef.id);
}

export const getAllGiftcards = async (userUid: string, user: string): Promise<GetAllGiftcardsReturnProps> => {

    const sorting = (a: Giftcard, b: Giftcard) => {
        if (!Date.parse(a.validDate!)) {
            return 1;
        }
        if (!Date.parse(b.validDate!)) {
            return -1;
        }
        // Convert the date strings to Date objects and compare them
        const dateA = new Date(a.validDate!);
        const dateB = new Date(b.validDate!);
        if (dateA < dateB) {
            return -1;
        }
        if (dateA > dateB) {
            return 1;
        }
        return 0;
    }

    const firestore = getFirestore(db);

    const q = query(collection(firestore, 'giftcards'), orderBy("validDate"))

    const users = query(collection(firestore, 'users'))

    const querySnapshotUsers = await getDocs(users);
    
    const querySnapshot = await getDocs(q);

    let filteredOnUserUid = await querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })).filter((doc: Giftcard) => doc.owner === userUid);

    if (user === 'jasper.huting@gmail.com') {
        filteredOnUserUid = await querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })).map((doc:Giftcard) => {
            const user = querySnapshotUsers.docs.find((userDoc) => {
                return userDoc.data().uid === doc.owner
                })
            return {
                ...doc,
                owner: user?.data().name
            }
        });
    }

    let totalAmount = 0;
    await filteredOnUserUid.forEach((d: Giftcard) => totalAmount += Number(d.amount))

    return {
        default: filteredOnUserUid.filter((doc: Giftcard) => doc.status === Status.DEFAULT).sort(sorting),
        expired: filteredOnUserUid.filter((doc: Giftcard) => doc.status === Status.EXPIRED).sort(sorting),
        used: filteredOnUserUid.filter((doc: Giftcard) => doc.status === Status.USED).sort(sorting),
        new: filteredOnUserUid.filter((doc: Giftcard) => doc.status === Status.NEW).sort(sorting),
        deleted: filteredOnUserUid.filter((doc: Giftcard) => doc.status === Status.DELETED).sort(sorting),
        amount: filteredOnUserUid.length,
        totalAmount: Number(totalAmount.toFixed()),
        allData: filteredOnUserUid.sort(sorting),
    }    


}


export const logout = () => {
  const auth = getAuth(db);
  signOut(auth);
};
