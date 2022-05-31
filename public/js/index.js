import { firebaseConfig, check, Register, Login, Logout, State, toMypage } from "./functions.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

check(firebase);

const Mypage = document.getElementById('Mypage');
const register = document.getElementById('register');
const login = document.getElementById('login');
const logout = document.getElementById('logout');
const userstate = document.getElementById('userstate');
let socket = io();
//マイページ遷移
Mypage.addEventListener('click', function(e) {
    e.preventDefault();
    toMypage(firebase);
    console.log(73146)
    
});
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
