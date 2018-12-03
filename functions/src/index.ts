import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
db.settings({
    timestampsInSnapshots: true,
})
const couponsCol = db.collection('coupons');
const stampsCol = db.collection('stamps');
const stampCardsCol = db.collection('stamp-cards');
const brandsCol = db.collection('brands');

export const checkStamp = functions.https.onCall(async (data, context) => {
    console.log("User info: ", context.auth);
    if(context.auth) {
        console.log("The user is valid!");
        try {
            const stampCode = data.id;
            const couponDoc = await couponsCol.doc(stampCode).get();
            const coupon = {...couponDoc.data(), id: couponDoc.id} as any;
            if(couponDoc.exists && coupon.available) {
                console.log("The coupon is valid!");
                await giveStamp(context.auth.uid, coupon)
                return {
                    success: true,
                }
            } else {
                // The coupon isn't valid
                console.log('The coupon is not valid')
                return {
                    success: false
                }
            }
        } catch(e) {
            console.log("ERROR!!!: ", e);
            return {
                success: false,
            }
        }
    } else {
        console.log("The user isn't authenticated")
        return {
            success: false,
        }
    }
});

function giveStamp(userUid, coupon) {
    // This is the stamp object
    console.log('Giving coupon ', coupon);
    const stamp = {
        couponCode: coupon.id,
        userUid: userUid,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    // First I make the coupon unavailable
    const couponsDeletePr = couponsCol.doc(coupon.id).update({
        available: false,
    })

    // Then I add it to the stamps collection
    const stampsAddPr = stampsCol.add(stamp);

    // And finally I update this user's stamp card information
    const updateStampCardP = brandsCol.doc(coupon.brandId).get().then(snap => {
        const brand = {
            ...snap.data(),
            id: snap.id,
        }
       return updateStampCard(userUid, stamp, brand);
    })
    return Promise.all([couponsDeletePr, stampsAddPr, updateStampCardP]);
}

async function updateStampCard(userUid, stamp, brand) {
    const stampCardSnapshot = await stampCardsCol
    .where('userUid', '==', userUid)
    .where('brand.id', '==', brand.id)
    .get();
    if(!stampCardSnapshot.empty) {
        // This user has at least one active stamp card,
        // so i'll find the one that has empty slots
        const stampCardDoc = stampCardSnapshot.docs.find(card => card.get('stampsCount') < brand.maxStamps);
        console.log('this user has a stamp card!')
        if(stampCardDoc) {
            await stampCardDoc.ref.set({
                stampsCount: stampCardDoc.get('stampsCount')+1,
                stamps: {
                    [stamp.couponCode]: stamp,
                },
            }, {merge: true});
        } else {
            // This user needs a new one!
            await stampCardsCol.add({
                userUid: userUid,
                stampsCount: 1,
                stamps: {
                    [stamp.couponCode]: stamp,
                },
                brand: brand
            });
        }
    } else {
        // This user has no stamp card
        console.log('this user has no stamp card!')
        await stampCardsCol.add({
            userUid: userUid,
            stampsCount: 1,
            stamps: {
                [stamp.couponCode]: stamp,
            },
            brand: brand
        });
    }
}