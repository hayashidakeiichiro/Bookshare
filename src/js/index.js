import { firebaseConfig, check, Register, Login, Logout, State, toMypage } from "./functions.js";
// import {} from "./functions.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
console.log(74)
check(firebase);


const register = document.getElementById('register');
const login = document.getElementById('login');
const logout = document.getElementById('logout');
const userstate = document.getElementById('userstate');
let socket = io();

//新規登録処理
register.addEventListener('click', function(e) {
    Register(firebase,socket);  
});

//ログイン処理
login.addEventListener('click', function(e) {
    Login(firebase);
});
//ログアウト処理
logout.addEventListener('click',async function(e) {
    Logout(firebase);
});
//ユーザ確認
userstate.addEventListener('click', function(e) {
    State(firebase);
});
