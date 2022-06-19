//File System modülünü dahil ettik
var fs = require('fs');

//üstteki sayaç kısmının o id deki değerlerini alıp yeni değişkene atıyoruz
var saat = document.getElementById("saat");
var dakika = document.getElementById("dakika");
var saniye = document.getElementById("saniye");

//number kutuları
var girilenSaat = document.getElementById("girilenSaat");
var girilenDakika = document.getElementById("girilenDakika");
var girilenSaniye = document.getElementById("girilenSaniye");

//butonlar
var baslatButonu = document.getElementById("baslat");
var iptalButonu = document.getElementById("iptal");

var iptal = false;

//number kutusundaki değer her değiştiğinde sayaç kısımdaki değerler de number kutusundaki değerlerle aynı olsun
//girilenSaat her değiştirildiğindeki üstteki sayaç kısımın içeriğine girilenSaat in değeri atansın
//eğer sayı 10 dan küçükse estetik durması için de başına 0 eklensin
girilenSaat.addEventListener("change", () => {
  saat.textContent = girilenSaat.value < 10 ? "0" + girilenSaat.value : girilenSaat.value;
});
girilenDakika.addEventListener("change", () => {
  dakika.textContent = girilenDakika.value < 10 ? "0" + girilenDakika.value : girilenDakika.value;
});
girilenSaniye.addEventListener("change", () => {
  saniye.textContent = girilenSaniye.value < 10 ? "0" + girilenSaniye.value : girilenSaniye.value;
});

//ilk başlatıldığında dosya çekme işlemi oluşturduğumuz json dosyasının içeriğini okur
fs.readFile('./config.json', 'utf-8', function (err, data) {
  
  if (err) throw err;
  
  //json dosyasının içeriği string olduğu için json tipine çevirir veri değişkenine atar
  let veri = JSON.parse(data);

  //Program kapatıldığında aktif sayaç var mı kontrol ettik
  if(veri.bitisTarihi ){
  //Eğer aktif sayaç varsa kalan saniye verisini hesaplıyoruz
  let zamanFark =  Math.floor(veri.bitisTarihi  - Date.now() / 1000);
  //Bu veriyi saat, dakika ve saniye cinsine çeviriyoruz
  let veriSaat = Math.floor(zamanFark / 3600);
  let veriDakika = Math.floor((zamanFark - veriSaat * 3600) / 60);
  let veriSaniye = Math.floor(zamanFark - veriSaat * 3600 - veriDakika * 60);
  //Eğer süre dolmadıysa çevirdiğimiz veri ile sayaç başlatıyoruz.
  if(zamanFark > 0)
    sayacBaslat(veriSaat, veriDakika, veriSaniye);
}
});

//başlat butonuna basınca çalışacak fonksiyonu oluşturduk
baslatButonu.addEventListener("click", () => { 
  sayacBaslat();
});

//fonksiyona boş değerler gönderip veri gelmiş mi gelmemiş mi kontrol ediyoruz
function sayacBaslat(saat_p = "", dakika_p = "", saniye_p = ""){
  let saat_;
  let dk;
  let sn;

  if(saat_p == "" && dakika_p == "" && saniye_p == "" ){
    //veri gelmediyse değerleri sayaçtan çektik 
    saat_ = saat.textContent;
    dk = dakika.textContent;
    sn = saniye.textContent;
  }else{
    //veri gelirse o verileri çekiyoruz burası json yani programın ilk başladığı kısımda kullanılıyor
    saat_ = saat_p < 10 ? "0" + saat_p : saat_p;
    dk = dakika_p < 10 ? "0" + dakika_p: dakika_p;
    sn = saniye_p < 10 ? "0" + saniye_p: saniye_p;
  }
  //gelen saat dk ve sn değerlerini sn cinsinde çeviriyoruz shutdown komutu için
  let toplamSure = Number(saat_)*3600 + Number(dk)*60+ Number(sn) ;

  //setInterval belirli aralıklarla (milisaniye cinsinden) bir işlevi çağırır. 
  //1000 ms olarak ayarladık böylece her sn fonksiyonu çağıracak ve sn dk saat değerlerini azaltacak ve geri sayacak
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
    //konsola saat dk ve sn değerleini her sn yazıyor kontrol amaçlı ekledim
    console.log(Number(saat_) + " " + Number(dk) + " " + Number(sn));


    //JSON kısmı zaman isimli bir json oluşturup verilerini ekliyoruz
    var zaman = {
      //sayacın biteceği tarih verisi saat dk ve sn verilerini jsona gönderdik
      bitisTarihi : Math.floor(Date.now()/1000 + saat_ * 3600 + dk * 60 + sn),
      veriSaat: saat_,
      veriDakika: dk,
      veriSaniye: sn
    };
    //zamanın içindeki verileri stringe çevirip data değişkenine atıyoruz
    var data = JSON.stringify(zaman);
    //verileri config.json doyasına yazıyoruz.
    fs.writeFile('./config.json', data, function (err) {
      if (err) {
        console.log('Hata!');
        console.log(err.message);
        return;
      }
    });

    //komutumuzu cmd den çalıştırmak için kullandığımız kısım 
    const nodeCmd = require('node-cmd');
    //shutdown -s -f -t ile t süre sonra bilgisayarın kapanmasını sağlıyoruz. t sn cinsinden
    var komut = "shutdown -s -f -t " + toplamSure;
    nodeCmd.run(komut, (err, data, stderr) => console.log(data));
    
    //saat dk ve sn verileri 0 lanırsa clearInterval ile ayarlanmış interval döngüsünü durdurur ve number kutularının içeriğini 0 yapar
    if ((saat_ == 00 && dk == 00 && sn == 00) || (saat_ == 0 && dk == 0 && sn == 0)) {
      clearInterval(interval);
      girilenSaat.value = "00";
      girilenDakika.value = "00";
      girilenSaniye.value = "00";
      
    //cmd kodlarımızı burda da yürütebilirdik. Tek farkı burada toplamSure verisini kullanmamıza gerek kalmaması  
    //const nodeCmd = require('node-cmd');
    //var komut = "shutdown -s -t "+ 0;
    //nodeCmd.run(komut, (err, data, stderr) => console.log(data));
    }

    //eğer iptal true olmuşsa (iptalbutonuna basınca çalışacak olan fonksiyonun içinde true oluyor) yine clearInterval ile interval döngüsü durdurulur
    if (iptal) {
      clearInterval(interval);
      return;
    }
    //her saniye değişen saat dk ve saniye değerlerini üstteki sayaçta güncellemek için
    saat.textContent = saat_.toString();
    dakika.textContent = dk.toString();
    saniye.textContent = sn.toString();
  }, 1000);  //interval kapanışı burda 1000 ile 1 sn de bir bu fonksiyonu çalıştır
}

//iptal et butonuna basınca çalışacak kısım
iptalButonu.addEventListener("click", () => {
  //jsondaki verilerimizin içeriklerini 0 yapıyoruz
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
  //false olarak değer atadığımız iptali true ya çeviriyoruz
  iptal = true;
  //shutdown komutunu iptal etmek için cmd ye komut gönderiyoruz
  const nodeCmd = require('node-cmd');
  var komut = "shutdown -a";
  nodeCmd.run(komut, (err, data, stderr) => console.log(data));
  //her iptal butonuna basıldığında sayfayı yeniler
  window.location.reload();  
});