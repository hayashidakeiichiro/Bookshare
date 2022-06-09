import { firebaseConfig, check, Register, Login, Logout, State, loginCheck } from "/js/functions.js";
firebase.initializeApp(firebaseConfig);

check(firebase);
const socket = io();
const db=firebase.firestore();

new Vue({
    el:"#searchform",
    data(){
        return{
            bookname:"",
            authorname:"",
            books:[],
            selectedBook:[],
            users:{},
            requestedBook:[],
            selectedBookIndex:''
        }
    },
    methods:{
        search:function(){
            const book = [];
            const author = [];
            for(let i=0;i<this.bookname.length-1;i++){
                book.push(this.bookname.substr(i,2))
            }
            for(let i=0;i<author.length-1;i++){
                author.push(this.authorname.substr(i,2))
            }
            console.log(book);
            socket.emit("booksearch",book,author)
        },
        select: async function(e){
            e.preventDefault();
            console.log(e.target.value);
            console.log(this.books);
            const isbn = await this.books[e.target.value][0]; 
            if (this.selectedBookIndex==isbn){
                this.selectedBookIndex=""
            } else{
                this.selectedBookIndex=isbn;
            }                
            const bname = await this.books[e.target.value][1];                  
            const bauth = await this.books[e.target.value][2]; 
            this.selectedBook = [isbn, bname, bauth];
            if (loginCheck(firebase)){
                if (Object.keys(this.users).indexOf(isbn)==-1){
                    const snapshot = await db.collection('books').doc(isbn).collection('users').get();
                    const users=[];
                    snapshot.forEach(doc=>{
                        users.push([doc.id, doc.data().name]);
                        console.log(doc.id);
                    })                                                
                    this.$set(this.users,isbn,users)
                }else{
                    console.log(this.users[isbn]);
                }
            }else{
                alert("ログインしてください")
            }
        },
        requestBook:function(e){
            console.log(this.users[this.selectedBookIndex][e.target.value][0]);
            const [uid, bid] = this.users[this.selectedBookIndex][e.target.value][0].split(":");
            const Myuid = sessionStorage.getItem('user');
            if (loginCheck(firebase) && Myuid!=uid){
                if (this.requestedBook.indexOf(uid+':'+Myuid+':'+bid)==-1){
                    socket.emit("requestBook",Myuid,uid,bid,this.selectedBook)
                    // console.log(uid)
                }else{
                    alert('リクエスト済みの本です')
                }
            }else if(Myuid==uid){
                alert('自分の本です')
            }else{
                alert('ログインしてください')
            }
        }
        
    },
    mounted() {
        socket.on("bookInfo",(info)=>{
            this.books=[];
            for(let item in info){
                console.log(info[item]);
                if(info[item].value.counter>0){
                    this.books.push([info[item].key, info[item].value.bname, info[item].value.bauth])
                }else{
                    break;
                }                       
            };
            console.log(this.books);
            if (this.books.length==0){
                this.books=[["検索結果は0件です","検索結果は0件です"]]
            }
        }),
        socket.on('requestedBook',(req)=>{
            this.requestedBook = req;
            // alert(req)
        })
        
    },
    created : function(){
        const requestInit = async (Myuid)=>{
            const snapshot = await db.collection('users').doc(Myuid).collection('request').onSnapshot((snapshot)=>{
                snapshot.docChanges().forEach((change)=>{
                    if (this.requestedBook.indexOf(change.id==-1)){
                        this.requestedBook.push(change.id);
                    }else{
                        this.requestedBook.splice(this.requestedBook.indexOf(change.id==-1),1);
                    }
                })
            });
            
        };
        if (sessionStorage.getItem('user')){
            const Myuid = sessionStorage.getItem('user');
            requestInit(Myuid);
        }
    }
})