
let SettingsUnfolded=false;
let savesUnfolded=true;
let inputValues=[0,0,0,0,0,0,0,0,0,0];//Namen für Savesfile
let inputNameSavesFilesVis=true;
let AskBeforeSaveAndLoad=true;
document.getElementById("UnfoldingSettings").click();
function toogleSettings(){
	let HTMLbutton=event.target;
	let UnfoldingContainer=document.getElementById("UnfoldingSettings");
	if(SettingsUnfolded){
		SettingsUnfolded=false;
		HTMLbutton.innerHTML=">";
		UnfoldingContainer.style.display="none";
	}
	else{
		SettingsUnfolded=true;
		HTMLbutton.innerHTML="v";
		UnfoldingContainer.style.display="block";
		updateSettingsHTML();
	}
}
function updateSettingsHTML(){
	document.getElementById("SavesContainer").innerHTML=createHTMLSaves();
}
function toggleSaves(){
	if(savesUnfolded){
		document.getElementById("SavesContainer").style.display="none";
		event.srcElement.innerHTML=">";
	}
	else{
		document.getElementById("SavesContainer").style.display="block";
		event.srcElement.innerHTML="v";
	}
	savesUnfolded=!savesUnfolded;
}

function createHTMLSaves(){
	let ls=window.localStorage;
	let maxAmountSaves=10;
	let ergHTML="";
	for(let i=0;i<maxAmountSaves;i++){
		if(ls.getItem("localSave"+(i))!==null){
			let currentItem=JSON.parse( JSON.parse( ls.getItem("localSave"+(i))   )  );
			//console.log(currentItem);
			
			inputValues[i]=currentItem.name;//actualise inputValues
			
			ergHTML+="<div class='localSave' id=localSave"+i+">"+
			"<span class='localSaveSlotTitle'>"+i+". Local Save Slot"+"</span>"+
			"<button name="+i+" onclick='SaveOntoThisSaves()'>Save</button>"+
			"<button name="+i+" onclick='loadSaves()'>Load</button>"+
			"<button name="+i+" onclick='ClearThatSave()'>-</button>"+
			((inputNameSavesFilesVis)?
			"<input type='text' class='localSaveInput' id='SavenameIDInput"+i+"' name='"+i+"' onchange='inputChange()' value='"+currentItem.name+"'></input>"
			:
			"<div class='localSaveName localSaveExtraInfo'>"+currentItem.name+"</div>"
			)+
			"<div class='localSaveExtraInfo'>Turn:"+currentItem.turn+" "+((currentItem.turn%2==0)?"white":"black")+" "+currentItem.time+"</div>"+
			"</div>";
			
		}
		else{
			ergHTML+="<div class='localSave' id=localSave"+i+">"+
			"<span class='localSaveSlotTitle'>"+i+". Empty Save Slot"+"</span>"+
			"<button name="+i+" onclick='SaveOntoThisSaves()'>Save</button>"+
			((inputNameSavesFilesVis)?
			"<input type='text' class='localSaveInput' id='SavenameIDInput"+i+"' name='"+i+"' onchange='inputChange()' value='ENTER here Save Name'></input>"
			:
			""
			)+
			"</div>";
			
			inputValues[i]="Unnamed"+i;//actualise inputValues
		}
		
	}
	ergHTML+="<button onclick='clearLokal()'>Delete All Lokal Saves</button>";
	return ergHTML;
}

function SaveOntoThisSaves(){
	let SlotNumber=event.target.name;
	let ls=window.localStorage;
	if(AskBeforeSaveAndLoad){
		let secondline=(ls.getItem("localSave"+SlotNumber)==null)?"":"\nYou will override this Save Slot!";//Check Slot already in use -> save would override
		let check=confirm("Do you really want to save on this slot?"+secondline);
		if(!check)return;
	}
	//Augment with meta data
	saveGameObject={...game};
	let sd=new Date();
	let [dd,mm,yyyy,hh,min]=[sd.getDate(),sd.getMonth()+1,sd.getFullYear(),sd.getHours(),sd.getMinutes()];
	saveGameObject["time"]=""+((dd<10)?"0"+dd:dd)+"."+((mm<10)?"0"+mm:mm)+"."+yyyy+"-"+((hh<10)?"0"+hh:hh)+":"+((min<10)?"0"+min:min);
	saveGameObject["name"]=inputValues[SlotNumber];
	
	//save
	let localSave=JSON.stringify(saveGameObject);
	ls.setItem("localSave"+SlotNumber,JSON.stringify(localSave));
	
	//update html
	updateSettingsHTML();
}

function loadSaves(){
	
	if(AskBeforeSaveAndLoad&&game.turn>0){//Never ask if you haven't made a move
		let check=confirm("Do you really want to load this slot?Current party will be lost if unsafed");
		if(!check)return;
	}
	let ls=window.localStorage;
	if(ls.getItem("localSave"+event.target.name)!==null){
		let loadgameString=JSON.parse(ls.getItem("localSave"+event.target.name));
		let loadgame= JSON.parse(loadgameString);
		//console.log(loadgame);
		
		//Kopie the game
		game.classMarked=loadgame.classMarked;
		game.turn=loadgame.turn;
		game.currentTime=loadgame.currentTime;
		game.currentDim=loadgame.currentDim;
		game.weltenbaum.mainDim=loadgame.weltenbaum.mainDim;
		game.currentBoard=game.weltenbaum.mainDim[game.currentTime];
		game.selection=null;
		game.moveRange=[];
		game.figuren=[];
		//console.log(game);
		
		
		// updates All HTML
		game.changeTime(game.currentTime);
	}
	else{
		console.log("Nothing found in local storage");
	}
}

function clearLokal(){
	let check=confirm("Do you really want to delete all your local save games?\nThey cannot be restored.");
	if(check){
		window.localStorage.clear();
		let SavesContainer=document.getElementById("UnfoldingSettings").children[0];
		SavesContainer.innerHTML=createHTMLSaves();
	}
}
function ClearThatSave(){
	let check=confirm("Do you really want to delete this  local save?\nIt cannot be restored.");
	if(check){
		let ls=window.localStorage;
		ls.removeItem("localSave"+event.target.name);
	
		updateSettingsHTML();
	}
}


function inputChange(){
	/*console.log(event);
	console.log(event.target);
	console.log(event.target.value);
	console.log(event.target.name);*/
	inputValues[event.target.name]=event.target.value;
}
function toggleNameSaveFiles(){
	inputNameSavesFilesVis=event.srcElement.checked;
	document.querySelectorAll(".localSaveInput").forEach(el=>{
		el.style.display=(inputNameSavesFilesVis)?"block":"none";
	});
	//Update HTML
	updateSettingsHTML();
}