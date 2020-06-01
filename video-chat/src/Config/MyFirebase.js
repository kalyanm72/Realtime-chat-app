import firebase from 'firebase'

const config = {
  apiKey: "AIzaSyBlLVDGn4bcSy3jXuCVYVUk231bRmWElVw",
authDomain: "miniproject-26e19.firebaseapp.com",
databaseURL: "https://miniproject-26e19.firebaseio.com",
projectId: "miniproject-26e19",
storageBucket: "miniproject-26e19.appspot.com",
messagingSenderId: "44564231383",
appId: "1:44564231383:web:10028f23860e26d6b92c92",
measurementId: "G-YSS77Y1MRC"
}
firebase.initializeApp(config)
firebase.firestore().settings({
  timestampsInSnapshots: true
})

export const myFirebase = firebase
export const myFirestore = firebase.firestore()
export const myStorage = firebase.storage()
