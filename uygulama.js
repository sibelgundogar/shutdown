var fs = require('fs');

var saat = document.getElementById("saat");
var dakika = document.getElementById("dakika");
var saniye = document.getElementById("saniye");

var girilenSaat = document.getElementById("girilenSaat");
var girilenDakika = document.getElementById("girilenDakika");
var girilenSaniye = document.getElementById("girilenSaniye");

var baslatButonu = document.getElementById("baslat");
var iptalButonu = document.getElementById("iptal");

var iptal = false;

girilenSaat.addEventListener("change", () => {
  saat.textContent = girilenSaat.value < 10 ? "0" + girilenSaat.value : girilenSaat.value;
});
girilenDakika.addEventListener("change", () => {
  dakika.textContent = girilenDakika.value < 10 ? "0" + girilenDakika.value : girilenDakika.value;
});
girilenSaniye.addEventListener("change", () => {
  saniye.textContent = girilenSaniye.value < 10 ? "0" + girilenSaniye.value : girilenSaniye.value;
});

fs.readFile('./config.json', 'utf-8', function (err, data) {
  
  if (err) throw err;
  
  let veri = JSON.parse(data);

  if(veri.bitisTarihi ){
  let zamanFark =  Math.floor(veri.bitisTarihi  - Date.now() / 1000);
  let veriSaat = Math.floor(zamanFark / 3600);
  let veriDakika = Math.floor((zamanFark - veriSaat * 3600) / 60);
  let veriSaniye = Math.floor(zamanFark - veriSaat * 3600 - veriDakika * 60);
  if(zamanFark > 0)
    sayacBaslat(veriSaat, veriDakika, veriSaniye);
}
});

baslatButonu.addEventListener("click", () => { 
  sayacBaslat();
});

function sayacBaslat(saat_p = "", dakika_p = "", saniye_p = ""){
  let saat_;
  let dk;
  let sn;

  if(saat_p == "" && dakika_p == "" && saniye_p == "" ){
    saat_ = saat.textContent;
    dk = dakika.textContent;
    sn = saniye.textContent;
  }else{
    saat_ = saat_p < 10 ? "0" + saat_p : saat_p;
    dk = dakika_p < 10 ? "0" + dakika_p: dakika_p;
    sn = saniye_p < 10 ? "0" + saniye_p: saniye_p;
  }
  let toplamSure = Number(saat_)*3600 + Number(dk)*60+ Number(sn) ;

  const interval = setInterval(() => {
    if(iptal == true) return;
    sn--;
    sn = sn < 10 ? "0" + sn : sn;
    if (sn == "0-1") {
      dk--;
      dk = dk < 10 ? "0" + dk : dk;
        if (dk == "0-1"){ 
          saat_--;
          saat_ = saat_ < 10 ? "0" + saat_ : saat_;
          if (saat_ == "0-1") saat_ = "00";
          dk = 59;
        }
      sn = 59;
    }
    console.log(Number(saat_) + " " + Number(dk) + " " + Number(sn));


    var zaman = {
      bitisTarihi : Math.floor(Date.now()/1000 + saat_ * 3600 + dk * 60 + sn),
      veriSaat: saat_,
      veriDakika: dk,
      veriSaniye: sn
    };
    var data = JSON.stringify(zaman);
    fs.writeFile('./config.json', data, function (err) {
      if (err) {
        console.log('Hata!');
        console.log(err.message);
        return;
      }
    });

    const nodeCmd = require('node-cmd');
    var komut = "shutdown -s -f -t " + toplamSure;
    nodeCmd.run(komut, (err, data, stderr) => console.log(data));
    
    if ((saat_ == 00 && dk == 00 && sn == 00) || (saat_ == 0 && dk == 0 && sn == 0)) {
      clearInterval(interval);
      girilenSaat.value = "00";
      girilenDakika.value = "00";
      girilenSaniye.value = "00";
      
    //komut istemcisi kodlarımızı burda da yürütebilirdik. Tek farkı burada toplamSure verisini kullanmamıza gerek kalmaması  
    //const nodeCmd = require('node-cmd');
    //var komut = "shutdown -s -t "+ 0;
    //nodeCmd.run(komut, (err, data, stderr) => console.log(data));
    }

    if (iptal) {
      clearInterval(interval);
      return;
    }
    saat.textContent = saat_.toString();
    dakika.textContent = dk.toString();
    saniye.textContent = sn.toString();
  }, 1000);  
}

iptalButonu.addEventListener("click", () => {
  let zaman = {
    veriSaat: 0 ,
    veriDakika: 0,
    veriSaniye: 0
  };
  let data = JSON.stringify(zaman);
  console.log(data);
  fs.writeFile('./config.json', data, function (err) {
    if (err) {
      console.log('Hata!');
      console.log(err.message);
      return;
    }
  });
  iptal = true;
  const nodeCmd = require('node-cmd');
  var komut = "shutdown -a";
  nodeCmd.run(komut, (err, data, stderr) => console.log(data));
  window.location.reload();  
});
