document.getElementById("log").onclick = fnLogin();
function fnLogin() {
 'use strict';
 var oUname = document.getElementById("uname");
 var oUpass = document.getElementById("upass");
 var oError = document.getElementById("error_box");
 var isError = true;

 //verify input account and password
 if (oUname.value.equals("admin") && oUpass.value.equals("123")) {
     window.alert("Login successfully!");
     window.location.href = "search.html";  
 }else {
	 oError.innerHTML = "Account or password is wrong!";
     isError = false;
	 return;
 }
 
}