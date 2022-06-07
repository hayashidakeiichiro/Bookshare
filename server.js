import express from "express";
const app = express();
import http  from "http";
import fs  from 'fs';
const server = http.Server(app);
import {Server as serverio} from 'socket.io'; 
const io = new serverio(server);
import ejs  from "ejs";
import router  from "./src/routers/route.js";
import {point}  from "./src/js/functions.js";

//admin
import admin  from "firebase-admin";
const serviceAccount =JSON.parse(fs.readFileSync("./serviceAccountKey.json","utf8"));
import { doc, updateDoc, deleteField } from "firebase/firestore";

admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    
const db = admin.firestore();


app.use("/", router);
app.use(express.static('src'));

io.on("connection",(socket)=>{
    socket.on("register",(uid,mail,name)=>{
        let usersRef = db.collection('users');
        usersRef.doc(uid).set({
            email:mail,
            point:20,
            name:name
        });
       
    });

    socket.on("bookgive", async (uid,isbn,bname,bauth)=>{
        let usersRef = db.collection('users').doc(uid);
        const bid = Math.random().toString(36).slice(-8);
        const bookSplit = [];
        const authorSplit = [];
        let username = "";

        await usersRef.get().then((doc)=>{
            username=doc.data().name
        });

        await usersRef.collection("books").doc(isbn).set({
            bname:bname,
            bauth:bauth,
        });
        await usersRef.collection("books").doc(isbn).collection('bid').doc(bid).set({
            days:"xxxx/xx/xx"
        });
        let booksRef = db.collection('books').doc(isbn);
        await booksRef.set({
            bname:bname,
            bauth:bauth
        })

        await db.collection('bookInfo').doc(bid).set({
            isbn:isbn,
            uid:uid,
            bname:bname,
            bauth:bauth,
            date:Date.now()
        })
        await booksRef.collection('users').doc(uid+':'+bid).set({
            days:'xxxx/xx/xx',
            name:username
        });

        //json 書き込み
        for(let i=0;i<bname.length-1;i++){
            bookSplit.push(bname.substr(i,2));
        }
        for(let i=0;i<bauth.length-1;i++){
            authorSplit.push(bauth.substr(i,2));
        }
        const jsonObj = JSON.parse(fs.readFileSync('./src/json/search.json','utf8'));
        jsonObj[isbn] = {bname:bname, bauth:bauth, counter:0}
        fs.writeFileSync('./src/json/search.json',JSON.stringify(jsonObj));
        console.log('give!')
        point(db, uid, 25)
    });

    socket.on('booksearch',(bookname,authorname)=>{
        const jsonObj = JSON.parse(fs.readFileSync('./src/json/search.json','utf8'));
        for (let i=0;i<bookname.length;i++){
            Object.keys(jsonObj).forEach((key)=>{
                if ((jsonObj[key]['bname']+jsonObj[key]['bauth']).indexOf(bookname[i])!=-1){
                    jsonObj[key]['counter']+=1;
                }
            })
          
        };
        
        let arr = Object.keys(jsonObj).map((e)=>({ key: e, value: jsonObj[e] }));
        arr.sort(function(a,b){
            if(a.value['counter'] < b.value['counter']) return 1;
            if(a.value['counter'] > b.value['counter']) return -1;
            return 0;
          });
        console.log(arr);
        socket.emit("bookInfo",arr);
            
    });

    socket.on('requestBook',async (Myuid,uid,bid,selectedBook)=>{
        const isbn = selectedBook[0];
        const bname = selectedBook[1];
        const bauth = selectedBook[2];
        //リクエスト相手のデータベース書き込み
        db.collection('users').doc(uid).collection('require').doc(uid+':'+Myuid+':'+bid).set({
            isbn:isbn,
            bid:bid
        })
        //リクエストした人のデータベース書き込み
        db.collection('users').doc(Myuid).collection('request').doc(uid+':'+Myuid+':'+bid).set({
            isbn:isbn,
            bid:bid
        })
        // const requestedBook = [];
        // const requestSnapshot = await db.collection('users').doc(Myuid).collection('request').get();
        // requestSnapshot.forEach(doc=>{
        //     requestedBook.push(doc.id);
        // })    
        // socket.emit("requestedBook",requestedBook);
        
    })

    socket.on('approvalBook',async (uid,approvalBook)=>{
        const [ouid,neguid,bid] = approvalBook.split(':');
        //同じ本のリクエストを全て削除
        await db.collection('users').doc(uid).collection('require').where('bid','==',bid)
        .get().then(async (snapshot)=>{
            // console.log(snapshot)
            snapshot.forEach((doc)=>{
                console.log(doc.id)
                const [delOuid, delNuid, bid]=doc.id.split(':');
                db.collection('users').doc(delNuid).collection('request').doc(doc.id).delete();
                
            })
        })
        await db.collection('users').doc(uid).collection('require').where('bid','==',bid)
        .get().then(async (snapshot)=>{
            // console.log(snapshot)
            snapshot.forEach((doc)=>{
                db.collection('users').doc(uid).collection('require').doc(doc.id).delete();
                
            })
        })

      
        db.collection('users').doc(neguid).collection('negRequest').doc(approvalBook).set({
            isbn:approvalBook
        });
        db.collection('users').doc(uid).collection('negRequire').doc(approvalBook).set({
            isbn:approvalBook,        
        });
       
        
        point(db, neguid, -100);
        point(db, uid, 100);

    })

    socket.on('getCompleteBook', async (uid,negBook)=>{
        const [ouid,neguid,bid] = negBook.split(':');
        db.collection('users').doc(neguid).collection('negRequest').doc(negBook).delete();
        db.collection('users').doc(ouid).collection('negRequire').doc(negBook).delete();

        let isbn = "";
        let bname = "";
        let bauth = "";
        await db.collection('bookInfo').doc(bid).get().then((doc)=>{
            isbn = doc.data().isbn;
            bname = doc.data().bname;
            bauth = doc.data().bauth;
        })
      
        db.collection('users').doc(neguid).collection('books').doc(isbn).set({
            bname:bname,
            bauth:bauth
        })
        db.collection('users').doc(neguid).collection('books').doc(isbn).collection('bid').doc(bid).set({
            days:"xxxx/xx/xx"
        });
        db.collection('users').doc(ouid).collection('books').doc(isbn).collection('bid').doc(bid).delete();
        
        db.collection('books').doc(isbn).collection('users').doc(ouid+':'+bid).delete();
        db.collection('books').doc(isbn).collection('users').doc(neguid+':'+bid).set({
            days:"xxxx/xx/xx"
        });

        db.collection('bookInfo').doc(bid).update({
            uid:neguid
        })

        console.log(negBook);
    })
  
    socket.on('cancelBook',(uid,cancelBook)=>{
        const [ouid,neguid,bid] = cancelBook.split(':');
        db.collection('users').doc(neguid).collection('request').doc(cancelBook).delete();

        db.collection('users').doc(ouid).collection('require').doc(cancelBook).delete();
        console.log(cancelBook)
    })
    socket.on('rejectBook',(uid,rejectBook)=>{
        const [ouid,neguid,bid] = rejectBook.split(':');
        db.collection('users').doc(neguid).collection('request').doc(rejectBook).delete();
        db.collection('users').doc(ouid).collection('require').doc(rejectBook).delete();
        console.log(rejectBook)
    })

    socket.on('chatMsg',(msg, chatId, uid)=>{
        console.log(chatId);
        const [ouid,neguid,bid] = chatId.split(':');
        db.collection('users').doc(ouid).collection('negRequire').doc(chatId).collection('chat').add({
            uid: uid,
            msg: msg,
            time: Date.now()
        })
    })
    
})

import {XMLHttpRequest} from "xmlhttprequest";
server.listen(process.env.PORT || 8080, () => {
    console.log("Success!");
});

// const requireInit = async (uid,socket)=>{
//     let requests=[];
//     const requestSnapshot = await db.collection('users').doc(uid).collection('request').get();
//     requestSnapshot.forEach(doc=>{
//         requests.push(doc.id);
//     })   
//     let requires=[];
//     const requireSnapshot = await db.collection('users').doc(uid).collection('require').get();
//     requireSnapshot.forEach(doc=>{
//         requires.push(doc.id);
//     })   
//     let negRequests=[];
//     const negRequestSnapshot = await db.collection('users').doc(uid).collection('negRequest').get();
//     negRequestSnapshot.forEach(doc=>{
//         negRequests.push(doc.id);
//     })  
//     let negRequires=[];
//     const negRequireSnapshot = await db.collection('users').doc(uid).collection('negRequire').get();
//     negRequireSnapshot.forEach(doc=>{
//         negRequires.push(doc.id);
//     })  
//     socket.emit("resetBookStatus",uid,requests,requires,negRequests,negRequires);
// }  