export const firebaseConfig = {
    apiKey: "AIzaSyBEafjtqRxBn3UxcXiVwTC0TkbocQEvwMY",
    authDomain: "auth-test-6f600.firebaseapp.com",
    projectId: "auth-test-6f600",
    storageBucket: "auth-test-6f600.appspot.com",
    messagingSenderId: "657486991476",
    appId: "1:657486991476:web:ed685434bd4b93f4548121"
};

export  function toMypage(firebase){

    firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        let uid = user.uid;
        if (sessionStorage.getItem("user")==uid){
            location.href="/Mypage";
        }else{
            alert('不正なログイン');
        }
    }else{
        console.log("ログインしていません")
        location.href="/";
    } 
    
    })
}

export  function check(firebase){

    firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        let uid = user.uid;
        if (sessionStorage.getItem("user")==uid){
            console.log("Log in!");
        }else{
            sessionStorage.setItem("user",uid)
        }
    }else{
        console.log("ログインしていません")
    }  
    })
}
export  async function loginCheck(firebase){
    let result = false;
    await firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        let uid = user.uid;
        if (sessionStorage.getItem("user")==uid){
            result = true;
            }
        }
    })
    return result;
}



export function Register(firebase,socket){
    console.log(43223253)
    let mail = document.getElementById('mail').value;
    let password = document.getElementById('password').value;
    firebase.auth().createUserWithEmailAndPassword(mail, password).then(user=>{
        let uid = user.user.uid;
        sessionStorage.setItem("user",uid);
        // firebase.auth().currentUser.sendEmailVerification();
        socket.emit("register",uid,mail);
        alert("登録成功");
    }), err=>{
        console.log(err);
        alert("error");
    }
}

export function Login(firebase){
    let mail = document.getElementById('mail').value;
    let password = document.getElementById('password').value;
    firebase.auth().signInWithEmailAndPassword(mail, password).then(user=>{
        if (user){
            let uid = user.user.uid;
            sessionStorage.setItem("user",uid);
            alert("ログイン成功");
        }else{
            console.log("ログイン失敗")
        }
    }), err=>{
        console.log(err);
    }
}


export function Logout(firebase){
    firebase.auth().signOut()
    .then(user => {
        sessionStorage.clear("user");
        alert("ログアウト成功");        
    })
}

export function State(firebase){
    firebase.auth().onAuthStateChanged((user) => {  
        if (user){
            let uid = user.uid;
            console.log(uid);
        } else{
            console.log("none")
        }   
    }), err=>{
        console.log(err)
    }
}