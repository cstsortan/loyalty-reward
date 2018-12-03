"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
db.settings({
    timestampsInSnapshots: true,
});
const couponsCol = db.collection('coupons');
const stampsCol = db.collection('stamps');
const stampCardsCol = db.collection('stamp-cards');
const brandsCol = db.collection('brands');
exports.checkStamp = functions.https.onCall((data, context) => __awaiter(this, void 0, void 0, function* () {
    console.log("User info: ", context.auth);
    if (context.auth) {
        console.log("The user is valid!");
        try {
            const stampCode = data.id;
            const couponDoc = yield couponsCol.doc(stampCode).get();
            const coupon = Object.assign({}, couponDoc.data(), { id: couponDoc.id });
            if (couponDoc.exists && coupon.available) {
                console.log("The coupon is valid!");
                yield giveStamp(context.auth.uid, coupon);
                return {
                    success: true,
                };
            }
            else {
                // The coupon isn't valid
                console.log('The coupon is not valid');
                return {
                    success: false
                };
            }
        }
        catch (e) {
            console.log("ERROR!!!: ", e);
            return {
                success: false,
            };
        }
    }
    else {
        console.log("The user isn't authenticated");
        return {
            success: false,
        };
    }
}));
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
    });
    // Then I add it to the stamps collection
    const stampsAddPr = stampsCol.add(stamp);
    // And finally I update this user's stamp card information
    const updateStampCardP = brandsCol.doc(coupon.brandId).get().then(snap => {
        const brand = Object.assign({}, snap.data(), { id: snap.id });
        return updateStampCard(userUid, stamp, brand);
    });
    return Promise.all([couponsDeletePr, stampsAddPr, updateStampCardP]);
}
function updateStampCard(userUid, stamp, brand) {
    return __awaiter(this, void 0, void 0, function* () {
        const stampCardSnapshot = yield stampCardsCol
            .where('userUid', '==', userUid)
            .where('brand.id', '==', brand.id)
            .get();
        if (!stampCardSnapshot.empty) {
            // This user has at least one active stamp card,
            // so i'll find the one that has empty slots
            const stampCardDoc = stampCardSnapshot.docs.find(card => card.get('stampsCount') < brand.maxStamps);
            console.log('this user has a stamp card!');
            if (stampCardDoc) {
                yield stampCardDoc.ref.set({
                    stampsCount: stampCardDoc.get('stampsCount') + 1,
                    stamps: {
                        [stamp.couponCode]: stamp,
                    },
                }, { merge: true });
            }
            else {
                // This user needs a new one!
                yield stampCardsCol.add({
                    userUid: userUid,
                    stampsCount: 1,
                    stamps: {
                        [stamp.couponCode]: stamp,
                    },
                    brand: brand
                });
            }
        }
        else {
            // This user has no stamp card
            console.log('this user has no stamp card!');
            yield stampCardsCol.add({
                userUid: userUid,
                stampsCount: 1,
                stamps: {
                    [stamp.couponCode]: stamp,
                },
                brand: brand
            });
        }
    });
}
//# sourceMappingURL=index.js.map