// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {GoogleAuthProvider, getAuth, signInWithPopup} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-xfVdwQO5xs5_CRHnA-Ri_PFKmx1y8pY",
  authDomain: "migo-db28a.firebaseapp.com",
  projectId: "migo-db28a",
  storageBucket: "migo-db28a.firebasestorage.app",
  messagingSenderId: "158786670457",
  appId: "1:158786670457:web:568417a2bfbf058d63a9a8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const provider = GoogleAuthProvider()
const auth = getAuth()

export const authWithGoogle = async() => {
    let user = null

    await signInWithPopup(auth, provider).then((result) => {
        user = result.user
    }).catch((err) => {
        console.log(err)
    })

    return user
}