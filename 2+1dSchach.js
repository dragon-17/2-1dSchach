// Object with important Brettcodierungen
const B={
	invalid:-1,
	free:0,
	colorMask:1, // 		0b                                       1 	erkennt farbe
	typMask:255, //			0b 	                             1111 1111	erkennt figure id
	ghostMask:512, // 		0b                             1 0000 0000 	noch unbesetzt
	phaseSplitMask:1024,// 	0b                            10 0000 0000	noch unbesetzt
	ageMask: 255<<12, // 	0b                1111 1111 0000 0000 0000	erkennt alter
	dimMask:255<<20, //		0b 0000 1111 1111 0000 0000 0000 0000 0000	erkennt Dimension 
	// dimMask, wenn Dimensionen spliten Schwarzer König Dimension0 von Schwarzer König Dimension1 zu unterscheiden
	
	ageShift:12,
	ageOne:1<<12,
	dimShift:20,
	dimOne:1<<20,
	
	//Colors  
	white:0, white_name:"white", abrevWhite:"w",  // white Figuren sollen gerade ( x%2 == x&0b0001 == 0 )  sein;
	black:1, black_name:"black", abrevBlack:"b",  // black Figuren sollen ungerade ( x%2 == x&0b0001 == 1 ) sein
	//Figuren
	bauer:"Bauer", abrevBauer:"b",
	turm:"Turm",	abrevTurm:"t",
	springer:"Springer", abrevSpringer:"s",
	laeufer:"Läufer",	abrevLauefer:"l",
	dame:"Dame",	abrevDame:"d",
	koenig:"König", abrevKoenig:"k",
	bauerN:8,
	turmN:2,
	springerN:2,
	laeuferN:2,
	dameN:1,
	koenigN:1,
	
	//Figuren Typnummern  mit initTypeNumbers() generiern 
};
// add necessary attributes to B. use it before everything else
function initTypeNumbers(){
	let count=2; //typeNummer
	let i=0;
	let seperator="_";
	name="name";
	for(i=0;i<B.bauerN;i++){//Bauern
		B[B.abrevWhite+seperator+B.abrevBauer+seperator+i]=count;
		B[count]=B.abrevBauer;
		B[count+seperator+name]=B.white_name+" "+B.bauer+" "+i;
		count++
		B[B.abrevBlack+seperator+B.abrevBauer+seperator+i]=count;
		B[count]=B.abrevBauer;
		B[count+seperator+name]=B.black_name+" "+B.bauer+" "+i;
		count++
	}
	for(i=0;i<B.turmN;i++){//Turm
		B[B.abrevWhite+seperator+B.abrevTurm+seperator+i]=count;
		B[count]=B.abrevTurm;
		B[count+seperator+name]=B.white_name+" "+B.turm+" "+i;
		count++
		B[B.abrevBlack+seperator+B.abrevTurm+seperator+i]=count;
		B[count]=B.abrevTurm;
		B[count+seperator+name]=B.black_name+" "+B.turm+" "+i;
		count++
	}
	for(i=0;i<B.springerN;i++){//Springer
		B[B.abrevWhite+seperator+B.abrevSpringer+seperator+i]=count;
		B[count]=B.abrevSpringer;
		B[count+seperator+name]=B.white_name+" "+B.springer+" "+i;
		count++
		B[B.abrevBlack+seperator+B.abrevSpringer+seperator+i]=count;
		B[count]=B.abrevSpringer;
		B[count+seperator+name]=B.black_name+" "+B.springer+" "+i;
		count++
	}
	for(i=0;i<B.laeuferN;i++){//Läufer
		B[B.abrevWhite+seperator+B.abrevLauefer+seperator+i]=count;
		B[count]=B.abrevLauefer;
		B[count+seperator+name]=B.white_name+" "+B.laeufer+" "+i;
		count++
		B[B.abrevBlack+seperator+B.abrevLauefer+seperator+i]=count;
		B[count]=B.abrevLauefer;
		B[count+seperator+name]=B.black_name+" "+B.laeufer+" "+i;
		count++
	}
	for(i=0;i<B.dameN;i++){//Dame
		B[B.abrevWhite+seperator+B.abrevDame+seperator+i]=count;
		B[count]=B.abrevDame;
		B[count+seperator+name]=B.white_name+" "+B.dame+" "+i;
		count++
		B[B.abrevBlack+seperator+B.abrevDame+seperator+i]=count;
		B[count]=B.abrevDame;
		B[count+seperator+name]=B.black_name+" "+B.dame+" "+i;
		count++
	}
	for(i=0;i<B.koenigN;i++){//König
		B[B.abrevWhite+seperator+B.abrevKoenig+seperator+i]=count;
		B[count]=B.abrevKoenig;
		B[count+seperator+name]=B.white_name+" "+B.koenig+" "+i;
		count++
		B[B.abrevBlack+seperator+B.abrevKoenig+seperator+i]=count;
		B[count]=B.abrevKoenig;
		B[count+seperator+name]=B.black_name+" "+B.koenig+" "+i;
		count++
	}
}
initTypeNumbers();

const M={
	up:-10,down:+10,left:-1,right:+1,left_up:-11,right_up:-9,left_down:+9,right_down:+11,
	jump_up_left:-21,jump_up_right:-19,
	jump_down_left:+19,jump_down_right:+21,
	jump_left_up:-12,jump_left_down:+8,
	jump_right_up:-8,jump_right_down:+12,
	
}

class Figur{
	constructor(typId,{pos_s=21,time=0,dim=0}){
		this.typ=typId;
		this.pos_s_t={pos_s,time,dim};
	}
	static getMoveRange( {pos_s=0,time=0,dim=0},weltenbaum,turn){
		let brett=weltenbaum.mainDim[time];
		let figure=brett[pos_s];
		if(figure<1)return [];
		const out=[];
		let [dir,langschrittig]=this.getMovementNormal(figure);
		//Normale Moves ohne Bauer
		for(let i=0;i<dir.length;i++){
			let currentPos=pos_s+dir[i];
			if(langschrittig){
				while(brett[currentPos]==0){
					
				out.push({pos_s: currentPos,time:time,dim:dim});
				currentPos=currentPos+dir[i];
				}
			}
			if(brett[currentPos]!=-1&&(brett[currentPos]==0||brett[currentPos]%2!=figure%2)&&
			(time==turn||Figur.notMovedToNow({pos_s:currentPos,time:time,dim:dim},weltenbaum )||brett[currentPos]==0) ){
				out.push({pos_s: currentPos,time:time,dim:dim});
			}
		}
		//Special moves
		if(B[figure&B.typMask]=="b"){//Bauer
			let dir=(figure%2==B.white)?[M.down]:[M.up];
			let currentPos=pos_s+dir[0];
			if(brett[currentPos]==0){
				out.push({pos_s: currentPos,time:time,dim:dim});
			}
			currentPos=currentPos+M.left;
			if(brett[currentPos]>0&&brett[currentPos]%2!=figure%2){
				out.push({pos_s: currentPos,time:time,dim:dim});
			}
			currentPos=currentPos+2*M.right;
			if(brett[currentPos]>0&&brett[currentPos]%2!=figure%2){
				out.push({pos_s: currentPos,time:time,dim:dim});
			}
			if((weltenbaum.mainDim[0][pos_s]&B.typMask)==(figure&B.typMask)){//Bauer auf startposition
				if(brett[ pos_s+dir[0]]==0&& brett[ pos_s+2*dir[0]]==0){
				out.push({pos_s: pos_s+2*dir[0],time:time,dim:dim});
				}
			}
		}
		//Zuege in die Vergangenheit
		if(time>2){
			let [pastDir,langschrittigPast]=this.getMovementPast(figure);
			for(let i=0;i<pastDir.length;i++){
				let currentPos=pos_s+pastDir[i];
				let timeI=2;
				let currentTime=time-timeI;
				let currentbrett=weltenbaum.mainDim[currentTime];
				if(langschrittigPast){
					while(currentTime>2&&currentbrett[currentPos]==0){
						out.push({pos_s: currentPos,time:currentTime,dim:dim});
						currentPos=currentPos+pastDir[i];
						currentTime-=timeI;
						currentbrett=weltenbaum.mainDim[currentTime];
					}
				}
				let targetFig=weltenbaum.mainDim[currentTime][currentPos];
				if( targetFig==0||
				(targetFig%2!=figure%2&&Figur.notMovedToNow({pos_s:currentPos,time:currentTime,dim:dim},weltenbaum))
				){
					out.push({pos_s: currentPos,time:currentTime,dim:dim});
				}
			}
			
		}
		//Zuege in die Zukunft
		if(time+1<turn){
			let [zukunftdir,langschrittigZukunft]=this.getMovementPast(figure);
			
			for(let i=0;i<zukunftdir.length;i++){
				let curTime=time+2;
				let currentPos=pos_s+zukunftdir[i];
				let targetFig=weltenbaum.mainDim[curTime][currentPos];
				while(curTime in weltenbaum.mainDim&&(weltenbaum.mainDim[curTime][currentPos]!=-1))
				{
					let targetFig=weltenbaum.mainDim[curTime][currentPos];
					if(targetFig==0
					||
					(targetFig%2!=figure%2&&Figur.notMovedToNow({pos_s:currentPos,time:curTime,dim:dim},weltenbaum))
					||
					((targetFig&B.typMask)==(figure&B.typMask)&&(targetFig&B.ageMask)>(figure&B.ageMask))
					){
						out.push({pos_s: currentPos,time:curTime,dim:dim});
						curTime+=2;
						currentPos+=zukunftdir[i];
					}
					else{
						break;
					}
				}
			}
		}
		return out;
	}
	// von, nach, wltenbaum, turn
	static move(  {pos_s=0,time=0,dim=0},{pos_s_target=0,time_target=0,dim_target=0},weltenbaum,turn ){
		let figur= weltenbaum.mainDim[time][pos_s];
		if(figur<1)return false;
		//create next board
		let currentBrett=weltenbaum.mainDim[turn];
		let nextBrett=currentBrett.map((e)=>e+=(e>0)?B.ageOne:0);
		weltenbaum.mainDim.push(nextBrett);
		if(time==turn){
			nextBrett[pos_s]=0;
		}
		let firstAfterfigure=weltenbaum.mainDim[time_target][pos_s_target];
		if(time_target==turn){//move without time travel in current turn
			
			nextBrett[pos_s_target]=figur+B.ageOne;
			
		}
		
		else if(time_target!=time&&(time_target in weltenbaum.mainDim)){ //time travell move 
			
			weltenbaum.mainDim[time_target][pos_s_target]=figur;
		}
		//Rest alter zukunft loeschen
		
		for(let curTime=time+1;curTime<=turn+1;curTime++){
			let previosfigur=weltenbaum.mainDim[curTime-1][pos_s];
			let nextfigur=weltenbaum.mainDim[curTime][pos_s];
			if( (nextfigur&B.typMask)==(figur&B.typMask)){//die gleiche figur
				if((nextfigur&B.ageMask)>(previosfigur&B.ageMask)){// next ist älter als prev , verhindert eigen vergangenheit zu töten
					weltenbaum.mainDim[curTime][pos_s]=0;
				}
			}
			else{
				break;
			}
		}
		//Zukunft auffüllen
		let k=1;
		
		for(let i=time_target+1;i<=turn+1;i++){
			let targetfigur=weltenbaum.mainDim[i][pos_s_target];
			if(targetfigur==0||(targetfigur&B.typMask)==(firstAfterfigure&B.typMask) ){
				
				weltenbaum.mainDim[i][pos_s_target]=figur+(k++)* B.ageOne;
				//Check King dead
				if(B[targetfigur&B.typMask]=='k'&&(targetfigur&B.ageMask)>>B.ageShift==turn){
					alert("King is dead");
				}
			}
			else{
				break;
			}
		}
		//Check King dead
				if(B[firstAfterfigure&B.typMask]=='k'&&(firstAfterfigure&B.ageMask)>>B.ageShift==turn){
					alert(((firstAfterfigure%2==B.white)?B.white_name:B.black_name)+" King is dead");
				}
	
	}
	static getMovementNormal(figure){//ohne Bauer, da dieser nur diagonal schlagen kann
		let dir=[];
		let langschrittig=false;
		switch(B[figure&B.typMask]) {
			
			case B.abrevTurm:
				dir=[M.up,M.down,M.left,M.right];
				langschrittig=true;
				break;
			case B.abrevSpringer:
				dir=[M.jump_up_left,M.jump_up_right,M.jump_left_up,M.jump_left_down,
				M.jump_right_up,M.jump_right_down,M.jump_down_left,M.jump_down_right];
				break;
			case B.abrevLauefer:
				dir=[M.left_up,M.right_up,M.left_down,M.right_down];
				langschrittig=true;
				break;
			case B.abrevDame:
				dir=[M.up,M.down,M.left,M.right,M.left_up,M.right_up,M.left_down,M.right_down];
				langschrittig=true;
				break;
			case B.abrevKoenig:
				dir=[M.up,M.down,M.left,M.right,M.left_up,M.right_up,M.left_down,M.right_down];
				break;
			default:
			dir=[];
		}
		return [dir,langschrittig];
	}
	static getMovementPast(figure){
		let dir=[];
		let langschrittig=false;
		switch(B[figure&B.typMask]) {
			case B.abrevBauer:
				dir=(figure%2==B.white)?[M.up]:[M.down];
				break;
			case B.abrevTurm:
				dir=[0];
				langschrittig=true;
				break;
			case B.abrevSpringer:
				dir=[2*M.up,2*M.down,2*M.left,2*M.right];
				break;
			case B.abrevLauefer:
				dir=[M.up,M.down,M.left,M.right];
				langschrittig=true;
				break;
			case B.abrevDame:
				dir=[M.up,M.down,M.left,M.right,0];
				langschrittig=true;
				break;
			case B.abrevKoenig:
				dir=[M.up,M.down,M.left,M.right];
				break;
			default:
			dir=[];
		}
		return [dir,langschrittig];
	}
	static notMovedToNow({pos_s=0,time=0,dim=0},weltenbaum){
		let figur= weltenbaum.mainDim[time][pos_s];
		if(figur<1)return false;
		time++;
		while(time in weltenbaum.mainDim){
			if((weltenbaum.mainDim[time][pos_s]&B.typMask)!=(figur&B.typMask)||(weltenbaum.mainDim[time][pos_s]==0)){
				return false;
			}
			time++;
		}
		return true;
	}
	get color(){
		return (this.typ%2==B.white)?B.abrevWhite:B.abrevBlack;
	}
	get isGhost(){
		return (this.typ&B.ghostMask)==B.ghostMask;
	}
	get isPhaseSplit(){
		return (this.typ&B.phaseSplitMask)==B.phaseSplitMask;
	}
	get age(){
		return (this.typ&B.ageMask)>>B.ageShift
	}
	get dim(){
		return (this.typ&B.dimMask)>>B.dimShift
	}
	get pos_s(){
		return this.pos_s_t.pos_s;
	}
	set neuerTyp(x){
		this.typ=x;
	}
}
class Weltenbaum{
	constructor(){
		this.mainDim=[makeBrett(8,8)];
		startFormation(this.mainDim[0]);
	}
	toHtml(time){
		let html="";
		const weltenBaum=document.getElementById("weltenbaum");
		this.mainDim.forEach((e,i)=>{
			html+="<div id='mainDim"+i+"' onclick='changeTime()' class='weltAst color"+i%20+" "+
			((time==i)?"currentWeltAst":"")+"' style='"+"outline-color:var( --color"+i%20+");border-color:var( --color"+i%20+");"+"'>Welt-Zeit: "+i+"</div>";
		});
		weltenBaum.innerHTML="";
		weltenBaum.insertAdjacentHTML("afterbegin", html);
	}
	getAge({pos_s=0,time=0,dim=0}){
		return (this.mainDim[time][pos_s]&B.ageMask)>>B.ageShift;
	}
	
	getTyp({pos_s=0,time=0,dim=0}){
		return this.mainDim[time][pos_s]&B.typMask;
	}
	getFigur({pos_s=0,time=0,dim=0}){
		return B[(this.mainDim[time][pos_s]&B.typMask)+"_name"];
	}
}
class Game{
	constructor(){
		this.classMarked="marked";
		this.turn=0;
		this.currentTime=0;
		this.currentDim=0;
		this.weltenbaum=new Weltenbaum();
		this.currentBoard=this.weltenbaum.mainDim[this.currentTime];
		setHTMLBoard(this.currentBoard);
		this.selection=null;
		this.moveRange=[];
		this.figuren=[];
		this.weltenbaum.toHtml(this.currentTime);
		this.toHtml();
	}
	set selectFigurOnField(x){
		let nextPos_s_t={pos_s:x,time:this.currentTime,dim:this.currentDim};
		if( JSON.stringify(nextPos_s_t) !== JSON.stringify(this.selection)  ){
			this.clearMark();
			this.selection={pos_s:x,time:this.currentTime,dim:this.currentDim};
			this.selection["age"]=this.weltenbaum.getAge(this.selection);
			this.moveRange=Figur.getMoveRange(this.selection,this.weltenbaum,this.turn);
			this.markCurrentBrett();
			
		}
		this.toHtml();	
	}
	markCurrentBrett(){
		this.moveRange.forEach((elm,i)=>{ if(elm.time==this.currentTime){
			document.getElementById("brett"+elm.pos_s).classList.add(this.classMarked);
			let tar=this.currentBoard[elm.pos_s];
			
			let sel=this.weltenbaum.mainDim[this.selection.time][this.selection.pos_s];
			if(tar>0&& tar%2==sel%2){
				// this is importan if a tower or queen goes back in the future
				// and overrides it self
				document.getElementById("brett"+elm.pos_s).classList.add("sameClass");
				
			}
		}
		});
	}
	drawCurrentBoard(){
		this.currentBoard=this.weltenbaum.mainDim[this.currentTime];
		setHTMLBoard(this.currentBoard);
		this.markCurrentBrett();
	}
	clearMark(){
		const markedFields=[...document.getElementsByClassName(this.classMarked)];
		markedFields.forEach((elm,i)=>{elm.classList.remove(this.classMarked);elm.classList.remove("sameClass");});
	}
	moveSelected(target_pos){
		if(this.selectedMovable() ){
			Figur.move( this.selection,{pos_s_target:target_pos,time_target:this.currentTime,dim_target:this.currentDim} ,this.weltenbaum,this.turn);
			this.turn++;
			this.changeTime(this.turn);
			this.drawCurrentBoard();
			this.weltenbaum.toHtml(this.currentTime);
			
			this.selection=null;
			this.moveRange=[];
			this.toHtml();
		}
	}
	moveSelectedCheckless(target_pos){
		Figur.move( this.selection,{pos_s_target:target_pos,time_target:this.currentTime,dim_target:this.currentDim} ,this.weltenbaum,this.turn);
		this.turn++;
		this.changeTime(this.turn);
		this.drawCurrentBoard();
		this.weltenbaum.toHtml(this.currentTime);
			
		this.selection=null;
		this.moveRange=[];
		this.toHtml();
	}
	changeTime(timeId){
		this.currentTime=timeId;
		this.currentBoard=this.weltenbaum.mainDim[this.currentTime];
		this.drawCurrentBoard();
		this.toHtml();
		this.weltenbaum.toHtml(this.currentTime);
		let htmlWB=document.getElementById("weltenbaum");
		
		let childW=htmlWB.lastChild.getBoundingClientRect().width;
		
		htmlWB.scrollBy(-10000000,0);//scroll to zero
		htmlWB.scrollBy(childW*game.currentTime,0);//scroll to current percentage
	}
	timeStep(timestep){
		let newTime=timestep+this.currentTime;
		this.changeTime((newTime in this.weltenbaum.mainDim)?newTime:(newTime<0)?0:this.weltenbaum.mainDim.length-1);
	}
	toHtml(){
		const {turn,currentTime,currentDim, selection,moveRange}=this;
		let html="<div class='runde' >Runde: "+(turn/2+1)+"</div>"+
		"<div  class='amZug "+((turn%2==0)?B.white_name:B.black_name)+"amZug'>"+((turn%2==0)?B.white_name:B.black_name)+" ist am Zug</div>"+
		"<div class='turn color"+turn%20+"'>Aktuelle Zeitphase:<span>"+turn+"</span></div>"+
		"<div class='zeit color"+currentTime%20+"'>Welt-Zeit: "+currentTime+"</div>"+
		" <div class='dim'> Dimension:"+currentDim+"(unused)</div>"+
		"<div class='selected'>Ausgewählte Figur:<br> "+
		((selection!=null)?
		this.weltenbaum.getFigur(selection)+"<br>"+PositonFigurFormatted(selection)
		:
		"<span class='warning'>--/--</span>")+
		((this.selectedMovable()||this.selection==null)?"":"<br><span class='warning'>"+
		((this.selctedIsDran())?"":"Deine Farbe ist nicht dran!")+
		((this.seletedYourTimeline())?"":"<br>Figur ist nicht in deiner Zeit!")+"</span><br>")+
		"</div>"+
		"<br> <div class='zuege' style='display:"+((this.selection==null)?"none":"block")+";'>Züge:<br> "+
		((moveRange?.length>0)?
			moveRange
				.map((e,i)=>{return "<div class='color"+(e.time%20)+"'>"+i+". "+PositonFormattedDimless(e)+"</div>";})
				.reduce((a,x)=>a+x)
			:
			"<span class='warning'>Keine Züge!</span>")+
		"</div>";
		const statusInfo=document.getElementById("status");
		
		statusInfo.innerHTML="";
		statusInfo.insertAdjacentHTML("afterbegin", html);
	}
	selctedIsDran(){// richtige farbe
		return (this.selection!=null)?(this.turn)%2==(this.weltenbaum.getTyp(this.selection))%2:false;
	}
	seletedYourTimeline(){
		return this.selection?.age==this.turn;
	}
	selectedMovable(){
		return this.selctedIsDran()&&this.seletedYourTimeline();
	}
	clearSelection(){
		this.selection=null;
		this.moveRange=[];
		this.drawCurrentBoard();
		this.toHtml();
	}
	moveRangeSelcted(){
		return this.moveRange;
	}
}

// Usful standalone locical/Stringformating Helper functions
function makeBrett(x=8,y=8){
	return Array( (x+2)*(y+4) ).fill().map(  (el, index)=>{
		return (  index%(x+2)==0||index%(x+2)==x+1||index<2*(x+2)||index>(x+2)*(y+4)-2*(x+2))?-1:0;
	}  ); 
}
function startFormation(brett){
	const whiteBackRow=[18,22,26,32, 30,28,24,20];
	const whiteFrontRow=[2, 4, 6, 8, 10, 12, 14, 16];
	const blackBackRow=[19, 23, 27, 33, 31, 29, 25, 21];
	const blackFrontRow=[3, 5, 7, 9, 11, 13, 15, 17];
	for(let i=1;i<9;i++){
		brett[20+i]=whiteBackRow[i-1];
		brett[30+i]=whiteFrontRow[i-1];
		brett[80+i]=blackFrontRow[i-1];
		brett[90+i]=blackBackRow[i-1];
	}
}
function PositonFigurFormatted(positonobject){
	if(positonobject==null||"undefined"==positonobject)positonobject={};
	const {pos_s=21,time=0,dim=0,age=0}=positonobject;
	return "Feld: "+pos_s+"  Welt-Zeit: "+time+" Eigen-Zeit: "+age;
}
function PositonFormattedDimless(positonobject){
	
	if(positonobject==null||"undefined"==positonobject)positonobject={};
	const {pos_s=21,time=0,dim=0}=positonobject;
	return "Feld: "+pos_s+"  Welt-Zeit: "+time;
}

// Helper for Console Prints
function fillStringTo(str, maxSpace=10){
	return ( str.length<maxSpace )? str+ Array(maxSpace-str.length).fill().map( e=>" ").reduce( (a,x)=>a+x,""):str.substring(0,maxSpace);
}
function getFigurString(elm,{dim=true,age=true,phaseSplit=true,ghost=true,typ=true,typName=false}){
	return ((dim)?"d"+((elm&B.dimMask)>>B.dimShift):"" )+
	((age)?"a"+((elm&B.ageMask)>>B.ageShift):"")+
	((ghost&&(elm&B.ghostMask))?"g":"")+
	((phaseSplit&&(elm&B.phaseSplitMask))?"p":"")+
	((typ)?((typName)?B[(elm&B.typMask)+"_name"]:B[(elm&B.typMask)]):"");
	
}
function printBrett(brett,x=8,y=8,  feldIndex=false,fieldspace=12,options={}){
	
	console.log("col   : "+Array(x+2).fill().map( (elm,index)=>fillStringTo(" "+index,fieldspace)  ).reduce( (a,x)=>a+x,""));
	for(let i=0;i<(y+4);i++){
		let k=0;
		console.log( "row "+ i+ ((i<10)?" ":"")+": "  
		 + brett.slice(i*(x+2),(i+1)*(x+2))
			.map( elm=>{let str =  ((feldIndex)?  (i*(x+2)+k++)+" ":"")+
						((elm<1)?//Bestzt von Figur
							elm+""
							:
							/*( "d"+((elm&B.dimMask)>>B.dimShift)+"a"+((elm&B.ageMask)>>B.ageShift)+"t"+(elm&B.typMask) )*/
							getFigurString(elm,options)
						);
						return  "%c"+fillStringTo(str,fieldspace);} 
				)
			.reduce( (a,x)=>a+x,"" ) ,
			...Array(x+2).fill()
			.map(
			(_,index)=>  (brett[i*(x+2)+index]==-1)?//Nicht auf gehbaren Brett
								" color:red;":
								(
								( ( brett[i*(x+2)+index]%2==0 )?((brett[i*(x+2)+index]==0)?"color:#ccccff;":"color:white;") : "color:black;" )+
								
								"font-weight: bold; background-color:"+
								((((index+i)&1))?
								"#bbb;":
								"#444;")
								)
			)
		);
	}
	console.log("Insgesamt: %f",brett.length);
	
}

//HTML Button Click Functions

//Click on field to try go there
const goThere=()=>{
	event.stopPropagation();
	let feldId=Number( event.srcElement.id.replace(/\D/g,""));

	if(game.selectedMovable()&&event.srcElement.classList.contains(game.classMarked)){
		game.moveSelectedCheckless(feldId);
	}
	else{
		game.selection=null;
		game.moveRange=[];
		game.drawCurrentBoard();
		game.toHtml();
	}
}

// Click on figure image to selct it
const selectFigure=()=>{
	event.stopPropagation();
	let feldId=Number( event.srcElement.parentElement.id.replace(/\D/g,""));
	let fig=game.currentBoard[feldId];
	let fieldMarked=event.srcElement.parentElement.classList.contains(game.classMarked);
	
	cursurOnSelection=(cursor==game.selection?.pos_s&&game.currentTime==game.selection?.time);
	if(fieldMarked&&game.selectedMovable()){
		game.moveSelectedCheckless(feldId);
		console.log(1);
	}else if(fig>0&&!cursurOnSelection){
		game.selectFigurOnField=feldId;	
console.log(2);		
	}else{
console.log(3);		
		game.selection=null;
		game.moveRange=[];
		game.drawCurrentBoard();
		game.toHtml();
	};
	moveCursur(cursor);
}
//Click on Time to change it
function changeTime(){
	event.stopPropagation();
	let timeId=Number( event.srcElement.id.replace(/\D/g,""));
	
	if(game.currentTime!=timeId){
		game.changeTime(timeId);
	}
}



//HTML Board
function setHTMLBoard(brett){
	let board=document.getElementById("board");	
	let html="";
	brett.forEach((elm,i)=>{
		if(elm!=-1){
			html+="<div onclick='goThere()'  class='feld "+(( (i+(i/10)<<0)%2 )?B.white_name:B.black_name )+
			((elm>0)?" occupied":"")+ "' id='brett"+i+"' title='"+i+"'"+
			" onmouseenter='moveCursurHere()' >"+
			((elm>0)?
			"<image id='figur"+elm+"' onclick='selectFigure()' class='"+"figure"+"' src='SpritesPNG/"+((elm%2==B.white)?B.white_name:B.black_name)+B[elm&B.typMask]+".png' title='"+i+" "+getFigurString(elm,{typName:true})+"'></image>"+
			"<div class='centered ageNumber color"+(( (elm&B.ageMask)>>B.ageShift)%20)+"' style='display:"+((ageNumbers)?"block":"none")+";'>"+( (elm&B.ageMask)>>B.ageShift)+"</div>"
			:"")
			+"</div>"
		}
	});
	board.innerHTML="";
	board.insertAdjacentHTML("afterbegin", html);
}


// Event Buttons/Keydown functions
function toggleAgeNumbers(){
	ageNumbers=!ageNumbers;
	[...document.getElementsByClassName('ageNumber')].forEach((e)=>{if(ageNumbers){
    e.style.display = 'block';} else {e.style.display = 'none';}})
}

function moveCursur(ziel){
	if(game.currentBoard[ziel]>-1){
		//Any Cursur/Hovermark
		let hOC="AnyhoverOrCursur";
		//Hovermarks under cursur
		let cursurCSSclassMovable="cursorOverMoveableUnit";
		let cursurCSSclassUnmovable="cursorOverUnmoveableUnit";
		let cursurCSSclassNeutral="cursorNeutral";//Cursur on unoccupied terrain
		
		//Hovermark over Terrain
		let HoverShortMark="shortMark";
		let NichtDranHoverShortMark="unmovableshortMark";
		
		// Remove All Hover/Cursur Markings
		const shortMarkedFields=[...document.getElementsByClassName(hOC)];
		shortMarkedFields.forEach((elm,i)=>{elm.classList.remove(
		HoverShortMark,NichtDranHoverShortMark,cursurCSSclassMovable,cursurCSSclassUnmovable,cursurCSSclassNeutral,hOC
		)});
		
		//update Cursur
		cursor=ziel;
		
		//Set new Cursur Hover marks
		if(cursurVisible){
			
			let selected=(game.selection!==null);
			if(selected){
				if(game.selectedMovable()){
					
					let cursurInSelection=game.moveRange.find(el=>{return el.pos_s==cursor&&game.currentTime==el.time});
					cursurInSelection=(cursurInSelection=== undefined)?false:true;
					
					cursurOnSelection=(cursor==game.selection.pos_s&&game.currentTime==game.selection.time);
					
					if(cursurInSelection||cursurOnSelection){
						
						document.getElementById("brett"+cursor).classList.add(cursurCSSclassMovable,hOC);
					}
					else{
						document.getElementById("brett"+cursor).classList.add(cursurCSSclassUnmovable,hOC);
					}
				}
				else{
						document.getElementById("brett"+cursor).classList.add(NichtDranHoverShortMark,hOC);
				}
			}
			else{
				let currentFigure=game.currentBoard[cursor];
				if(currentFigure>0){
					let rightColor=(game.turn)%2==currentFigure%2;
					let rightPase=(currentFigure&B.ageMask)>>B.ageShift==game.turn;
					
					let moveRange=Figur.getMoveRange({pos_s:cursor,time:game.currentTime,dim:1},game.weltenbaum,game.turn);
					
					if(moveRange.length==0){//Mark cursur Unmoveable cause Fig can't move
						document.getElementById("brett"+cursor).classList.add(cursurCSSclassUnmovable,hOC);
					}
					else{
						if(rightColor&&rightPase){
						document.getElementById("brett"+cursor).classList.add(cursurCSSclassMovable,hOC);
					}
					else{//Mark cursur Unmoveable cause Fig is not in right time and can't move
						document.getElementById("brett"+cursor).classList.add(cursurCSSclassUnmovable,hOC);
					}
					}
					//Goable Path marks only when nothing is Selected
					moveRange.forEach((elm,i)=>{ if(elm.time==game.currentTime){
					if(rightColor&&rightPase){
						document.getElementById("brett"+elm.pos_s).classList.add(HoverShortMark,hOC);
					}else{
						document.getElementById("brett"+elm.pos_s).classList.add(NichtDranHoverShortMark,hOC);
					}
					}});
				}
				else{
					document.getElementById("brett"+cursor).classList.add(cursurCSSclassNeutral,hOC);
				}
			}
		}
	}
}
function moveCursurHere(){// onmouseenter in every field
	event.stopPropagation();
	let feldId=Number( event.srcElement.id.replace(/\D/g,""));
	moveCursur(feldId);
}
function moveCurserArrow(x,y){
	if(game.currentBoard[cursor+x]>-1)moveCursur(cursor+x);
	if(game.currentBoard[cursor+10*y]>-1)moveCursur(cursor+10*y);
}	
function pressEnter(){
	let fig=game.currentBoard[cursor];
		let fieldMarked=document.getElementById("brett"+cursor).classList.contains(game.classMarked);
		if(fieldMarked&&game.selectedMovable()){
			
			game.moveSelectedCheckless(cursor);
		}else if(fig==-1||fig==0||(game.selection!=null&& game.selection.pos_s==cursor&&game.selection.time==game.currentTime)){
			game.selection=null;
			game.moveRange=[];
			game.drawCurrentBoard();
			game.toHtml();
		}else{
			game.selectFigurOnField=cursor;		
		};
		moveCursur(cursor);
}
function cursurVisiblillity(){
	cursurVisible=event.srcElement.checked;
	moveCursur(cursor);//updaten;
}

// Code Start


initTypeNumbers();

let ageNumbers=true;
let cursor=21;
let cursurVisible=true;


let game=new Game();

// Event Listerner
document.addEventListener("keydown",(e)=>{ 
	
	if(e.srcElement.constructor.name!=='HTMLInputElement'){//Don't fire when you use an input element
	
		if(e.key=="e"){game.timeStep(1);}
		if(e.key=="q"){game.timeStep(-1);}
		if(e.key=="E"){game.timeStep(2);}
		if(e.key=="Q"){game.timeStep(-2);}
		if(e.key=="ArrowUp"||e.key=="w"||e.key=="W"){moveCurserArrow(0,-1);}
		if(e.key=="ArrowDown"||e.key=="s"||e.key=="S"){moveCurserArrow(0,1);}
		if(e.key=="ArrowLeft"||e.key=="a"||e.key=="A"){moveCurserArrow(-1,0);}
		if(e.key=="ArrowRight"||e.key=="d"||e.key=="D"){moveCurserArrow(1,0);}
		
		if(e.key=="X"||e.key=="x"){
		toggleAgeNumbers();
		//Invert corresponding checkbox to avoid unscychrinized
		document.getElementById("ageNumbersVisible").checked=!document.getElementById("ageNumbersVisible").checked;
		}
		if(e.key=="C"||e.key=="c"){
			cursurVisible=!cursurVisible;
			document.getElementById("cursurVisible").checked=!document.getElementById("cursurVisible").checked;
		}
		if(e.key=="Enter"){
			pressEnter();
		}
		moveCursur(cursor);
	}
;});
