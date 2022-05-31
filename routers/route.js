import express from "express";
const router  = express.Router();
import ejs from "ejs";
const app = express();
app.engine("ejs",ejs.renderFile);


router.get('', (req,res) => {
    res.render('../index.ejs')
  })
router.get('/get', (req,res) => {
    res.render('../get.ejs')
  })
router.get('/Mypage', (req,res) => {
    res.render('../Mypage.ejs')
  })
router.get('/give', (req,res) => {
    res.render('../give.ejs')
  })

export {router as default};


  

