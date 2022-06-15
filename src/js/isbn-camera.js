//スキャナの表示非表示切り替え
const wrapper = document.getElementById("barcode-wrapper");
let blnCameraInit = false;//カメラ初期化が正常終了したかどうか

//生の映像　ページには表示しない
const video = document.createElement("video");
video.muted=true;
video.playsInline=true;

//videoのサイズ【カメラの画素数に合わせて入力】
const videoSize = {
    w: 640,
    h: 480
};

//表示領域のサイズ【任意の値を入力】
const viewSize = {
    w: 300,
    h: 200
};

//表示領域用のパラメータ 
const viewParam = {
    init: false,
    sx: 0,
    sy: 0,
    sw: 0,
    sh: 0,
    dx: 0,
    dy: 0,
    dw: 0,
    dh: 0
};

//バーコードスキャン部分のサイズとガイドの太さ【任意の値を入力】
const targetSize = {
    w: 200,
    h: 100,
    border: 2
};

//バーコードスキャン部分のパラメータ
const targetParam = {
    sx: 0,
    sy: 0,
    sw: 0,
    sh: 0,
    dx: 0,
    dy: 0,
    dw: 0,
    dh: 0
};

//バーコードガイドのパラメータ
const sqParam = {
    valid : false,
    x: 0,
    y: 0,
    w: 0,
    h: 0
};

// Quagga用のパラメータ
const qConfig={
  decoder: { 
    readers: ["ean_reader","ean_8_reader"],
    multiple: false, //同時に複数のバーコードを解析しない
  },
  src:''//後から指定
};

//線画領域
const barView = document.getElementById("barcode-view");
//　線画領域のコンテキスト取得
const barViewCtx = barView.getContext("2d");

//　内部処理用のバーコード領域のコンテキスト取得
const barcodeArea = document.createElement("canvas");
const barcodeAreaCtx=barcodeArea.getContext("2d");

const message = document.getElementById("message");



//スキャンのインターバル(ミリ秒)
const INTERVAL = 160;

//コードのエラーチェック回数
const VALIDATION = 3;
let validationCnt = 0;
let validationCode = "";


// スキャンされた回数　-1の時スキャンしない
let scanningCnt = -1; 
let reserveEnd=null;

function initBarcodeScaner() {
    blnCameraInit = false;
    
    //カメラ使用の許可ダイアログが表示される
    navigator.mediaDevices.getUserMedia(
    //マイクはオフ, カメラの設定   背面カメラを希望する 640×480を希望する
    {"audio":false,"video":{facingMode:"environment","width":{"ideal": videoSize.w},"height":{"ideal": videoSize.h}}}
    ).then(
    //カメラと連携が取れた場合
    function(stream){
        video.srcObject = stream;
        blnCameraInit = true;
        message.innerHTML="";
        
        }
    ).then(()=>{

        wrapper.classList.remove("view-off");
        wrapper.classList.add("view-on");
        setTimeout(scanStart,2000)
    })
    .catch(
    //エラー時
    function(err){
        switch(err.message) {
        case "Requested device not found":
            message.innerHTML="カメラ取得に失敗しました";
            break;
        default:
            message.innerHTML=err.message;
        }
        
    }
    );

}

function scanStart() {
    video.play();
    //setIntervalだと処理の遅延のかかわらず実行してしまうので都度再帰する。
    scanningCnt = 0;

    wrapper.style.visibility="visible";

    if (blnCameraInit==false) {
        reserveEnd = setTimeout(() => {
            wrapper.style.visibility="hidden";
        }, 3000);
    } else {
        setTimeout(scanning,0);
    }
}
function initParam() {

    //すでに初期化されていた場合は処理しない
    if (viewParam.init) {
        return;
    }

    //実際取得したサイズは要求したサイズと違う際は上書きされる。
    //videoが開始されていないと0になる
    videoSize.w=video.videoWidth
    videoSize.h=video.videoHeight;
    
    //線画領域のサイズセット
    //barView.style.width = viewSize.w;
    //barView.style.height = viewSize.h;

    //canvasは属性値でサイズを指定する必要がある
    barView.setAttribute("width",viewSize.w);
    barView.setAttribute("height",viewSize.h);
    
    
    //表示領域の計算
    if (videoSize.w <= viewSize.w) {
        //元のサイズの方が小さかったらそのまま
        viewParam.sx = 0;
        viewParam.sw = videoSize.w;
        
        viewParam.dx = 0;
        viewParam.dw = videoSize.w;
    } else {
        //中央部を取得
        let wk = videoSize.w - viewSize.w;
        if (wk < 0) {
            message.innerHTML="サイズ設定不備(view-X)";
            blnCameraInit = false;
            return;
        }
        wk = wk /2; //中央寄せするので÷2

        viewParam.sx = wk;
        viewParam.sw = viewSize.w;
        
        viewParam.dx = 0;
        viewParam.dw = viewSize.w;
    }
    if (videoSize.h <= viewSize.h) {
        //元のサイズの方が小さかったらそのまま
        viewParam.sy = 0;
        viewParam.sh = videoSize.h;
        
        viewParam.dy = 0;
        viewParam.dh = videoSize.h;
    } else {
        //中央部を取得
        let wk = videoSize.h - viewSize.h;
        if (wk < 0) {
            message.innerHTML="サイズ設定不備(view-Y)";
            blnCameraInit = false;
            return;
        }
        wk = wk /2; //中央寄せするので÷2

        viewParam.sy = wk;
        viewParam.sh = viewSize.h;
        
        viewParam.dy = 0;
        viewParam.dh = viewSize.h;
    }

    //バーコードスキャン部分の計算
    if (videoSize.w <= targetSize.w) {
        //元のサイズの方が小さかったらそのまま
        targetParam.sx = 0;
        targetParam.sw = videoSize.w;
        
        targetParam.dx = 0;
        targetParam.dw = videoSize.w;
    } else {
        //中央部を取得
        let wk = videoSize.w - targetSize.w;
        if (wk < 0) {
            message.innerHTML="サイズ設定不備(target-X)";
            blnCameraInit = false;
            return;
        }
        wk = wk /2; //中央寄せするので÷2

        targetParam.sx = wk;
        targetParam.sw = targetSize.w;
        
        targetParam.dx = 0;
        targetParam.dw = targetSize.w;
    }
    if (videoSize.h <= targetSize.h) {
        //元のサイズの方が小さかったらそのまま
        targetParam.sy = 0;
        targetParam.sh = videoSize.h;
        
        targetParam.dy = 0;
        targetParam.dh = videoSize.h;
    } else {
        //中央部を取得
        let wk = videoSize.h - targetSize.h;
        if (wk < 0) {
            message.innerHTML="サイズ設定不備(target-Y)";
            blnCameraInit = false;
            return;
        }
        wk = wk /2; //中央寄せするので÷2

        targetParam.sy = wk;
        targetParam.sh = targetSize.h;
        
        targetParam.dy = 0;
        targetParam.dh = targetSize.h;
    }

    //バーコードガイドの設定
    sqParam.valid = true;
    sqParam.w = targetSize.w;
    sqParam.h = targetSize.h;
    sqParam.x = (viewSize.w - targetSize.w) / 2;
    if (sqParam.x < 0) {
        sqParam.valid = false;
    }
    sqParam.y = (viewSize.h - targetSize.h) / 2;
    if (sqParam.y < 0) {
        sqParam.valid = false;
    }
    
    viewParam.init = true;
   
}

function toggleScan() {
    if(wrapper.style.visibility=="visible") {
        scanEnd();
    } else {
        scanStart();
    }
}


function scanning() {
    //スキャン本体
    if (scanningCnt < 0) {
        return;
    }

    //パラメータ初期化()
    initParam();

    scanningCnt++;

    //バーコードエリアに線画
    barcodeAreaCtx.drawImage(video,targetParam.sx,targetParam.sy,targetParam.sw,targetParam.sh,targetParam.dx,targetParam.dy,targetParam.dw,targetParam.dh);

    //線画からバーコード解析
    barcodeArea.toBlob(function(blob){
      let reader = new FileReader();
      reader.onload=function(){
        qConfig.src=reader.result;
        Quagga.decodeSingle(qConfig,function(){});
      }
      reader.readAsDataURL(blob);
    });
    
    //プレビューエリアに線画
    //処理が遅くなるような場合は、scanningCntを使ってプレビューの線画を間引く
    //if (scanningCnt % 2 == 0) {}
    barViewCtx.drawImage(video,viewParam.sx,viewParam.sy,viewParam.sw,viewParam.sh,viewParam.dx,viewParam.dy,viewParam.dw,viewParam.dh);

    //バーコードガイドの線画
    if(sqParam.valid) {
        barViewCtx.beginPath();
        barViewCtx.strokeStyle="rgb(255,0,0)";
        barViewCtx.lineWidth=targetSize.border;
        barViewCtx.rect(sqParam.x,sqParam.y,sqParam.w,sqParam.h);
        barViewCtx.stroke();
    }

    //再帰
    setTimeout(scanning,INTERVAL);
}

function scanEnd() {
    if (reserveEnd != null) {
        clearTimeout(reserveEnd);
    }
    scanningCnt=-1;
    video.pause();
    wrapper.style.visibility="hidden";
    validationCnt = 0;
    validationCode="";
}

//画面の移動

function draggable(target) {
    target.onmousedown = function() {
      document.onmousemove = mouseMove;
    };
    document.onmouseup = function() {
      document.onmousemove = null;
    };
    function mouseMove(e) {
      var event = e ? e : window.event;
      target.style.top = (event.clientY-140) + 'px';
      target.style.left = (event.clientX-170) + 'px';
    }
  }

  draggable(wrapper);