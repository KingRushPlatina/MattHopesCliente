// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGT1jB8KZqhECiCxxpPyg5OzhcUb0KhRM",
  authDomain: "databasematt-912c4.firebaseapp.com",
  projectId: "databasematt-912c4",
  storageBucket: "databasematt-912c4.firebasestorage.app",
  messagingSenderId: "934104923696",
  appId: "1:934104923696:web:da5152a56bc5ffeefe77f5",
  measurementId: "G-S8PDHSM1NT"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firebase Storage
if (typeof firebase.storage !== 'undefined') {
  window.firebaseStorage = firebase.storage();
}

// Export config for other modules
window.firebaseConfig = firebaseConfig;
