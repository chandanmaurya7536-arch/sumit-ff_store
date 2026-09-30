import {auth,db,storage} from "../firebase.js";

import{
signInWithEmailAndPassword,
signOut
}from"https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

import{
collection,
addDoc,
getDocs,
deleteDoc,
doc
}from"https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

import{
ref,
uploadBytes,
getDownloadURL
}from"https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// LOGIN

window.login=async()=>{

await signInWithEmailAndPassword(
auth,
email.value,
password.value
);

location="dashboard.html";

};

// LOGOUT

window.logout=async()=>{

await signOut(auth);

location="login.html";

};

// ADD ID

window.addID=async()=>{

const urls=[];

for(const file of images.files){

const r=ref(storage,"ids/"+Date.now()+file.name);

await uploadBytes(r,file);

urls.push(await getDownloadURL(r));

}

await addDoc(collection(db,"ids"),{

title:title.value,

price:Number(price.value),

level:level.value,

rank:rank.value,

evo:evo.value,

desc:desc.value,

sold:sold.checked,

images:urls

});

alert("Published");

loadIDs();

};

// LOAD IDs

async function loadIDs(){

const list=document.getElementById("list");

if(!list)return;

list.innerHTML="";

const snap=await getDocs(collection(db,"ids"));

let t=0,a=0,s=0;

snap.forEach(x=>{

const d=x.data();

t++;

d.sold?s++:a++;

list.innerHTML+=`

<div class="card">

<img src="${d.images[0]}">

<h3>${d.title}</h3>

<p>₹${d.price}</p>

<p>${d.rank}</p>

<p>${d.sold?"🔴 SOLD":"🟢 AVAILABLE"}</p>

<div class="actions">

<button class="edit">Edit</button>

<button class="delete" onclick="removeID('${x.id}')">Delete</button>

</div>

</div>

`;

});

if(total){

total.innerText=t;

available.innerText=a;

soldCount.innerText=s;

}

}

window.removeID=async(id)=>{

await deleteDoc(doc(db,"ids",id));

loadIDs();

};

loadIDs();