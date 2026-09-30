const params=new URLSearchParams(location.search);

const id=params.get("id")||"FF ID";
const price=params.get("price")||999;

document.getElementById("idName").innerText=id;
document.getElementById("amount").innerText="₹"+price;

document.getElementById("payBtn").onclick=()=>{
location.href=`upi://pay?pa=YOURUPI@okicici&pn=SumitFFStore&am=${price}&cu=INR`;
};

const form=document.getElementById("orderForm");

form.onsubmit=async(e)=>{
e.preventDefault();

const data=new FormData(form);

data.append("account",id);
data.append("amount",price);

const r=await fetch("/api/telegram",{
method:"POST",
body:data
});

if(r.ok){
alert("Order Submitted Successfully");
form.reset();
}else{
alert("Submission Failed");
}
};