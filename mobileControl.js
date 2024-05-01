
let Mobilcheckbox=document.getElementById("mobileControllVis");
if(isMobile()){
	showMobilControll();
	Mobilcheckbox.checked=true;
}
else{
	hideMobilControll();
	Mobilcheckbox.checked=false;
}


function isMobile(){
	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))return true;
	return false;  
}
function moblileCOntroll(){
	if(event.srcElement.checked){
		showMobilControll();
	}
	else{
		hideMobilControll();
	}
}

function hideMobilControll(){
	document.getElementById("mobileSteuerung").style.display="none";
}
function showMobilControll(){
	document.getElementById("mobileSteuerung").style.display="block";
}	

function resizeMobilControll(){
	let value=event.target.value;
	//update Slider Value display
	document.getElementById("MobilControllResizeSliderValue").innerHTML=value;
	//Get MObil Controll;
	let mc=document.getElementById("mobileSteuerung");
	mc=mc.querySelectorAll("button");
	mc.forEach( (el,i)=>{
		el.style.fontSize=value-0.75+"vw";
		el.style.width=value+"vw";
		el.style.height=value+"vw";
	} );
}