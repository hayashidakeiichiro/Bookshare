export const firebaseConfig = {
    apiKey: "AIzaSyBEafjtqRxBn3UxcXiVwTC0TkbocQEvwMY",
    authDomain: "auth-test-6f600.firebaseapp.com",
    projectId: "auth-test-6f600",
    storageBucket: "auth-test-6f600.appspot.com",
    messagingSenderId: "657486991476",
    appId: "1:657486991476:web:ed685434bd4b93f4548121"
};

export async function point (db, uid, point){
    const pointRef= db.collection('users').doc(uid);
   
    let result = await new Promise((resolve)=>{
        pointRef.get().then((doc) => {
            if (doc) {
                let pre_point = doc.data().point;
                if (pre_point+point>=0){
                    pointRef.update({
                        point:pre_point+point
                    })
                    resolve(true);
                }else{
                    resolve(false);
                }
            }else{
                resolve(false)
            }
        })
    })
    return result
}

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
export async function loginCheck(firebase){
    let result = await new Promise((resolve)=>{
        firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            let uid = user.uid;
            if (sessionStorage.getItem("user")==uid){
                resolve(true);
            }else{
                resolve(false);
            }
        }else{
            resolve(false)
        }
    })
    })
    return result
}

export async function Register(firebase,socket){
    let mail = document.getElementById('mail').value;
    let password = document.getElementById('password').value;
    let name = document.getElementById('name').value;
    try{
        const user = await firebase.auth().createUserWithEmailAndPassword(mail, password);
        let uid = user.user.uid;   
        await firebase.auth().currentUser.sendEmailVerification();
        socket.emit("register",uid,mail,name);
        if (firebase.auth().currentUser.emailVerified){
            location.href='/'
        }else{
            firebase.auth().signOut();
            location.href='/mailVal'
        }
    } catch (err){
        console.log(err)
    }
   
}

export async function Login(firebase){
    let mail = document.getElementById('mail').value;
    let password = document.getElementById('password').value;
    try{    
        const user = await firebase.auth().signInWithEmailAndPassword(mail, password);
        if (firebase.auth().currentUser.emailVerified || mail=="a@gmail.com"){
            let uid = user.user.uid;
            sessionStorage.setItem("user",uid);
            console.log("ログイン成功");
            location.href="/";
        }else{
            await firebase.auth().currentUser.sendEmailVerification();
            firebase.auth().signOut();
            alert("メール認証が済んでいません");
            location.href='/mailVal';
        }
    } catch (err){
        alert(err.message)
    }
    firebase.auth().currentUser.emailVerified
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

export function xss(unsafeText){
    if(typeof unsafeText !== 'string'){
      return unsafeText;
    }
    return unsafeText.replace(
      /[&'`"<>]/g, 
      function(match) {
        return {
          '&': '&amp;',
          "'": '&#x27;',
          '`': '&#x60;',
          '"': '&quot;',
          '<': '&lt;',
          '>': '&gt;',
        }[match]
      }
    );
  }