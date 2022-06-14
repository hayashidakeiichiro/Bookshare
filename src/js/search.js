import { firebaseConfig, check, Register, Login, Logout, State, loginCheck, xss } from "/js/functions.js";
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
            selectedBookIndex:'',
            modal:false,
            modalInfo:{e:0}
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
            loginCheck(firebase).then(async (item)=>{
                if(item){
                    if (Object.keys(this.users).indexOf(isbn)==-1){
                        const snapshot = await db.collection('books').doc(isbn).collection('users').get();
                        const users=[];
                        snapshot.forEach(doc=>{
                            if (doc.data().request){

                            }else{
                                users.push([xss(doc.id), xss(doc.data().name), xss(doc.data().region), xss(doc.data().detail)]);
                            }
                           
                        })                                                
                        this.$set(this.users,isbn,users)
                    }else{
                        console.log(this.users[isbn]);
                    }
                }else{
                    alert("ログインしてください")
                }
            })
        },
        requestBook:function(e){
            // const [uid, bid] = this.users[this.selectedBookIndex][e.target.value][0].split(":");
            const [uid, bid] = this.modalInfo.e[0].split(":");
            const Myuid = sessionStorage.getItem('user');
            loginCheck(firebase).then(item=>{
                if (item && Myuid!=uid){
                    
                    if (this.requestedBook.indexOf(uid+':'+Myuid+':'+bid)==-1){
                        socket.emit("requestBook",Myuid,uid,bid,this.selectedBook)
                       
                    }else{
                        alert('リクエスト済みの本です')
                    }
                }else if(Myuid==uid){
                    alert('自分の本です')
                }else{
                    alert('ログインしてください')
                }
            })
        },
        modalOn:function(item, title, author){
            this.modal=true;
            this.modalInfo["e"]=item;
            this.modalInfo["title"]=title;
            this.modalInfo["author"]=author;
        },
        modalOff:function(){
            this.modal=false
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
        })
        socket.on("failedPoint",()=>{
            alert("ポイントが足りません。")
        })
        socket.on("successPoint",()=>{
            alert("リクエストを送りました。")
        })       
        socket.on("requested",()=>{
            alert("すみません、他の人にリクエストされた本です。")
        })       
    },
    created(){
        
        async  function init(Myuid,list){

            await db.collection('users').doc(Myuid).collection('negRequest').onSnapshot((snapshot)=>{
                snapshot.docChanges().forEach((change)=>{
                    if (list.indexOf(change.doc.id==-1)){
                        list.push(xss(change.doc.id));
                    }else{
                        list.splice(list.indexOf(xss(change.doc.id)),1);
                    }
                })
            });
        }


        if (sessionStorage.getItem('user')){
            init(sessionStorage.getItem('user'),this.requestedBook)
        }
    }
})