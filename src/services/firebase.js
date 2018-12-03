import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/functions'
import { user } from 'rxfire/auth'
import { collectionData } from 'rxfire/firestore'
import { switchMap } from 'rxjs/operators'
import { of } from 'rxjs'

firebase.initializeApp({
  apiKey: 'AIzaSyAau6vVO_VMmazhq1mvPl2ZD09z3N7bUaw',
  authDomain: 'tichu-helper.firebaseapp.com',
  databaseURL: 'https://tichu-helper.firebaseio.com',
  projectId: 'tichu-helper',
  storageBucket: 'tichu-helper.appspot.com',
  messagingSenderId: '146099346136'
});
const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });
db.enablePersistence();
const checkStampFunction = firebase.functions().httpsCallable('checkStamp');

const auth = firebase.auth();
auth.signInAnonymously().then(cred => {
  const userUid = cred.user.uid;
  db.collection('users').doc(userUid).set({
    userUid: userUid
  })
})  ;

window.firebase = firebase;

export function checkStamp (id) {
  return checkStampFunction({ id: id })
}

export function getStampCards () {
  return user(auth).pipe(switchMap(user => {
    if (!user) {
      return of([])
    } else {
      const stampCardsQuery = db.collection('stamp-cards')
        .where('userUid', '==', user.uid)
        .orderBy('stampsCount', 'desc');
      return collectionData(stampCardsQuery, 'id')
    }
  }))
}

export function getUserBrands () {
  return user(auth).pipe(switchMap(user => {
    if (!user) {
      return of([])
    } else {
      const brandsQuery = db.collection('brands')
        .where('ownerUid', '==', user.uid);
      return collectionData(brandsQuery, 'id')
    }
  }))
}

export function createBrand (brand) {
  if (!auth.currentUser) return;
  db.collection('brands').add({
    ...brand,
    ownerUid: auth.currentUser.uid
  })
}

export function createCoupons (brandId, count) {
  for (let i = 0; i < count; i++) {
    console.log('creating coupon!');
    db.collection('coupons').add({
      brandId: brandId,
      available: true
    })
  }
}

export function getCoupons (brandId) {
  return db.collection('coupons')
    .where('brandId', '==', brandId)
    .where('available', '==', true)
    .get()
    .then(snap => {
      return snap.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    })
}
