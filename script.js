/* ===========================
   SUMIT FF STORE
   Premium Flow Script
=========================== */

// -------- Pages --------

const homePage=document.getElementById("home");
const storePage=document.getElementById("storePage");
const paymentPage=document.getElementById("paymentPage");

function showPage(page){

[homePage,storePage,paymentPage].forEach(p=>{
p.classList.remove("active");
p.classList.add("hidden");
});

page.classList.remove("hidden");
page.classList.add("active");

window.scrollTo({top:0,behavior:"instant"});
}

window.openStore=()=>showPage(storePage);
window.goHome=()=>showPage(homePage);
window.openPayment=()=>showPage(paymentPage);

// -------- Hero Slider --------

const heroSlides=document.querySelectorAll(".hero img");

let heroIndex=0;

setInterval(()=>{

heroSlides[heroIndex].classList.remove("show");

heroIndex=(heroIndex+1)%heroSlides.length;

heroSlides[heroIndex].classList.add("show");

},3000);

// -------- Floating Particles --------

const hero=document.querySelector(".hero");

if(hero){

for(let i=0;i<45;i++){

const p=document.createElement("div");

p.className="particle";

p.style.left=Math.random()*100+"%";

p.style.animationDuration=(5+Math.random()*6)+"s";

p.style.animationDelay=Math.random()*5+"s";

hero.appendChild(p);

}

}

// -------- Card Sliders --------

document.querySelectorAll(".slider").forEach(slider=>{

const slides=slider.querySelectorAll(".slide");

let index=0;

const next=slider.querySelector(".right");
const prev=slider.querySelector(".left");

next.onclick=()=>{

slides[index].classList.remove("show");

index=(index+1)%slides.length;

slides[index].classList.add("show");

};

prev.onclick=()=>{

slides[index].classList.remove("show");

index=(index-1+slides.length)%slides.length;

slides[index].classList.add("show");

};

// Finger Swipe

let startX=0;

slider.addEventListener("touchstart",e=>{
startX=e.touches[0].clientX;
});

slider.addEventListener("touchend",e=>{

let endX=e.changedTouches[0].clientX;

if(endX<startX-40) next.click();

if(endX>startX+40) prev.click();

});

});

// -------- Image Zoom --------

const viewer=document.createElement("div");

viewer.id="viewer";

viewer.innerHTML='<img id="viewerImg">';

document.body.appendChild(viewer);

const viewerImg=document.getElementById("viewerImg");

Object.assign(viewer.style,{
position:"fixed",
inset:"0",
display:"none",
justifyContent:"center",
alignItems:"center",
background:"rgba(0,0,0,.92)",
zIndex:"99999"
});

Object.assign(viewerImg.style,{
maxWidth:"92%",
maxHeight:"92%",
borderRadius:"20px"
});

document.querySelectorAll(".slide").forEach(img=>{

img.onclick=()=>{

viewer.style.display="flex";

viewerImg.src=img.src;

};

});

viewer.onclick=()=>viewer.style.display="none";

// -------- Payment Flow --------

let currentID="FF ID";
let currentPrice=999;

window.buyNow=(name,price)=>{

currentID=name;

currentPrice=price;

document.getElementById("payTitle").innerText=name;

document.getElementById("payAmount").innerText="₹"+price;

showPage(paymentPage);

};

// -------- UPI --------

window.payUPI=()=>{

const link=`upi://pay?pa=YOURUPI@okicici&pn=SumitFFStore&am=${currentPrice}&cu=INR`;

window.location.href=link;

};

// -------- Submit --------

// -------- Submit Order --------

window.submitOrder=async()=>{

const phone=document.getElementById("phone").value.trim();
const utr=document.getElementById("utr").value.trim();
const file=document.getElementById("shot").files[0];

if(!/^[0-9]{10}$/.test(phone)){
alert("Valid 10 digit mobile number dalo.");
return;
}

if(utr.length<10){
alert("Valid UTR Number dalo.");
return;
}

if(!file){
alert("Payment Screenshot upload karo.");
return;
}

const formData=new FormData();

formData.append("phone",phone);
formData.append("utr",utr);
formData.append("photo",file);
formData.append("id",currentID);
formData.append("amount",currentPrice);

try{

const res=await fetch("/api/telegram",{
method:"POST",
body:formData
});

if(!res.ok){
throw new Error("Server error");
}

const success=document.getElementById("success");

success.style.display="block";

success.animate([
{opacity:0,transform:"scale(.9)"},
{opacity:1,transform:"scale(1)"}
],{
duration:350,
fill:"forwards"
});

}catch(error){

console.error(error);

alert("Order submit nahi hua. Please try again.");

}

};

// -------- Bottom Nav --------

document.querySelectorAll(".bottom button").forEach((btn,i)=>{

btn.onclick=()=>{

if(i===0) goHome();

if(i===1) openStore();

if(i===2) openPayment();

if(i===3) window.open("https://t.me/YOUR_USERNAME");

};

});

// -------- Loading Feel --------

window.addEventListener("load",()=>{

document.body.animate([
{opacity:.92},
{opacity:1}
],{
duration:350
});

});