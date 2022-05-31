import express from "express";
const app = express();
import http  from "http";
import fs  from 'fs';
const server = http.Server(app);
import {Server as serverio} from 'socket.io'; 
const io = new serverio(server);
import ejs  from "ejs";
import router  from "./routers/route.js";

//admin
import admin  from "firebase-admin";
const serviceAccount =JSON.parse(fs.readFileSync("./serviceAccountKey.json","utf8"));
import { doc, updateDoc, deleteField } from "firebase/firestore";

admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    
const db = admin.firestore();


app.use("/", router);
app.use(express.static('public'));

io.on("connection",(socket)=>{
    socket.on("register",(uid,mail)=>{
        let usersRef = db.collection('users');
        usersRef.doc(uid).set({
            email:mail,
            point:20,
        });
       
    });

    socket.on("bookgive", (uid,isbn,bname,bauth)=>{
        let usersRef = db.collection('users').doc(uid).collection("books");
        const bid = Math.random().toString(36).slice(-8);
        const bookSplit = [];
        const authorSplit = [];
        
        usersRef.doc(isbn).set({
            bname:bname,
            bauth:bauth,
        });
        usersRef.doc(isbn).collection('bid').doc(bid).set({
            days:"xxxx/xx/xx"
        });
        let booksRef = db.collection('books').doc(isbn);
        booksRef.set({
            bname:bname,
            bauth:bauth,
            // bookSplit:bookSplit,
            // authorSplit:authorSplit
        })

        booksRef.collection('users').doc(uid+':'+bid).set({
            days:'xxxx/xx/xx'
        });

        //json 書き込み
        for(let i=0;i<bname.length-1;i++){
            bookSplit.push(bname.substr(i,2));
        }
        for(let i=0;i<bauth.length-1;i++){
            authorSplit.push(bauth.substr(i,2));
        }
        const jsonObj = JSON.parse(fs.readFileSync('./public/json/search.json','utf8'));
        jsonObj[isbn] = {bname:bname,counter:0}
        fs.writeFileSync('./public/json/search.json',JSON.stringify(jsonObj));
        console.log('success')
    });

    socket.on('booksearch',(bookname,authorname)=>{
        const jsonObj = JSON.parse(fs.readFileSync('./public/json/search.json','utf8'));
        for (let i=0;i<bookname.length;i++){
            Object.keys(jsonObj).forEach((key)=>{
                if (jsonObj[key]['bname'].indexOf(bookname[i])!=-1){
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
            isbn:isbn
        })
        //リクエストした人のデータベース書き込み
        db.collection('users').doc(Myuid).collection('request').doc(uid+':'+Myuid+':'+bid).set({
            isbn:isbn
        })
        const requestedBook = [];
        const requestSnapshot = await db.collection('users').doc(Myuid).collection('request').get();
        requestSnapshot.forEach(doc=>{
            requestedBook.push(doc.id);
        })    
        socket.emit("requestedBook",requestedBook);
        requireInit(uid,io);
    })

    socket.on('approvalBook',(uid,approvalBook)=>{
        const [ouid,neguid,bid] = approvalBook.split(':');
        db.collection('users').doc(neguid).collection('request').doc(approvalBook).delete();

        db.collection('users').doc(uid).collection('require').doc(approvalBook).delete();
        console.log(neguid)
            
        db.collection('users').doc(neguid).collection('negRequest').doc(approvalBook).set({
            isbn:approvalBook
        });
        db.collection('users').doc(uid).collection('negRequire').doc(approvalBook).set({
            isbn:approvalBook
        });
        requireInit(ouid,socket);   
        requireInit(neguid,io);   
        

    })

    socket.on('getCompleteBook',(uid,negBook)=>{
        const [ouid,neguid,bid] = negBook.split(':');
        db.collection('users').doc(neguid).collection('negRequest').doc(negBook).delete();

        db.collection('users').doc(ouid).collection('negRequire').doc(negBook).delete();
        console.log(negBook);
        requireInit(ouid,socket)
        requireInit(neguid,io);   
    })
    socket.on('giveCompleteBook',(uid,negBook)=>{
        const [ouid,neguid,bid] = negBook.split(':');
        db.collection('users').doc(neguid).collection('negRequest').doc(negBook).delete();

        db.collection('users').doc(ouid).collection('negRequire').doc(negBook).delete();
        console.log(negBook);
        requireInit(ouid,socket)
        requireInit(neguid,io);   
    })
    socket.on('cancelBook',(uid,cancelBook)=>{
        const [ouid,neguid,bid] = cancelBook.split(':');
        db.collection('users').doc(neguid).collection('request').doc(cancelBook).delete();

        db.collection('users').doc(ouid).collection('require').doc(cancelBook).delete();
        console.log(cancelBook)
        requireInit(ouid,io);   
        requireInit(neguid,socket)
    })
    socket.on('rejectBook',(uid,rejectBook)=>{
        const [ouid,neguid,bid] = rejectBook.split(':');
        db.collection('users').doc(neguid).collection('request').doc(rejectBook).delete();
        db.collection('users').doc(ouid).collection('require').doc(rejectBook).delete();
        console.log(rejectBook)
        requireInit(ouid,socket)
        requireInit(neguid,io);   
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

server.listen(process.env.PORT || 8080, () => {
    console.log("Success!")
    // let promise = new Promise((resolve, reject)=>{
    //     console.log(1)
    //     resolve('hello')
    // })

    // promise.then((msg)=>{
    //     console.log(111)
    // }).catch
});

const requireInit = async (uid,socket)=>{
    let requests=[];
    const requestSnapshot = await db.collection('users').doc(uid).collection('request').get();
    requestSnapshot.forEach(doc=>{
        requests.push(doc.id);
    })   
    let requires=[];
    const requireSnapshot = await db.collection('users').doc(uid).collection('require').get();
    requireSnapshot.forEach(doc=>{
        requires.push(doc.id);
    })   
    let negRequests=[];
    const negRequestSnapshot = await db.collection('users').doc(uid).collection('negRequest').get();
    negRequestSnapshot.forEach(doc=>{
        negRequests.push(doc.id);
    })  
    let negRequires=[];
    const negRequireSnapshot = await db.collection('users').doc(uid).collection('negRequire').get();
    negRequireSnapshot.forEach(doc=>{
        negRequires.push(doc.id);
    })  
    socket.emit("resetBookStatus",uid,requests,requires,negRequests,negRequires);
}  