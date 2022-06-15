import express from "express";
import ejs from "ejs";
const router  = express.Router();
const __dirname = new URL(import.meta.url).pathname;
const app = express();
import * as path from "path"




router.get('', (req,res) => {
    res.sendFile(path.join(__dirname, '/../../html/index.html'))
  })
router.get('/get', (req,res) => {
    res.sendFile(path.join(__dirname, '/../../html/get.html'))
  })
router.get('/Mypage', (req,res) => {
    res.sendFile(path.join(__dirname, '/../../html/Mypage.html'))
  })
router.get('/give', (req,res) => {
    res.sendFile(path.join(__dirname, '/../../html/give.html'))
  })
router.get('/login', (req,res) => {
    res.sendFile(path.join(__dirname, '/../../html/login.html'))
  })
router.get('/register', (req,res) => {
    res.sendFile(path.join(__dirname, '/../../html/register.html'))
  })
router.get('/mailVal', (req,res) => {
    res.sendFile(path.join(__dirname, '/../../html/mailVal.html'))
  })
router.get('/alert', (req,res) => {
    res.sendFile(path.join(__dirname, '/../../html/alert.html'))
  })

export {router as default};


  

