//---------------------------------------------------------//
// Poker                                             //
//                                                         //
// (c) Copyright by Vasian CEPA 2001. All rights reserved. // 
// email: @                                 //
//---------------------------------------------------------//

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var IMAGE_BACK = new Image(); // global
var IMG_USER_NORMAL = new Image();
var IMG_USER_HAPPY = new Image();
var IMG_USER_SAD = new Image();
	
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function CardSource(){
	this.deck = new Deck();
	this.init = CardSource_init;
	this.reset = CardSource_reset;
}

function CardSource_init(){
	this.deck.init();
	this.deck.shuffle();
}

function CardSource_reset(){
	this.deck.shuffle();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function CardsHand(id){
	this.id = id;
	this.cards = new Array(5);

	this.init = CardsHand_init;
	this.reset = CardsHand_reset;
	this.draw = CardsHand_draw;
}

function CardsHand_init(){
	if(IMAGE_BACK.src == null){
		IMAGE_BACK.src = "images/cards/b.gif";
	}
	for(var i = 0; i < 5; i++){
		this.cards[i] = null;
	}
}

function CardsHand_reset(){
	for(var i = 1; i <= 5; i++){
		document.images["img" + i + "_" + this.id].src = IMAGE_BACK.src;
		document.handForm.elements["chkHold" + i  + "_" + this.id] .checked = false;
		this.cards[i - 1] = null;
	}
}

function CardsHand_draw(){
	var outStr = "<table>";
	var cardRow = "<tr>";
	var holdRow = "<tr>";
	var nameSuffix = '_' + this.id;

	for(var i = 1; i <= 5; i++){
		var imgName = 'img' + i + nameSuffix;
		var chkName = 'chkHold' + i + nameSuffix;
		cardRow += '\n<td><a href="javascript:void(0)" onClick="checkHold(' + i + ',\'' + imgName + '\');return false;"><img name="' + imgName + '" src="images/cards/b.gif" border="1"></a></td>';
		holdRow += '\n<td><input type=checkbox name="' + chkName + '" onClick="checkHold(' + i + ',\'' + chkName + '\');">Hold</td>';
	}

	cardRow += "</tr>";
	holdRow += "</tr>";
	outStr += cardRow + holdRow + "\n</table>"; 
	document.write(outStr);
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function PokerCombinations(){
	this.combinations = null;
	this.selectedCombinations = null;
	this.combNames = new Array(
		"Pair",
		"Two Pair",
		"Three of a Kind",
		"Straight",
		"Flush",
		"Full House",
		"Four of a Kind",
		"Straight Flush",
		"Royal Flush");

	this.init = PokerCombinations_init;
	this.reset = PokerCombinations_reset;
	this.draw = PokerCombinations_draw;
	this.select = PokerCombinations_select;
}

function PokerCombinations_init(){
	this.combinations = new Array(9);
	this.selectedCombinations = new Array(9);
	for(var i = 0; i < 9; i++){
		this.combinations[i] = new Image();
		this.combinations[i].src = "images/poker/p0" + i + ".gif"	
		this.selectedCombinations[i] = new Image();
		this.selectedCombinations[i].src = "images/poker/pc0" + i + ".gif"	
	}
}

function PokerCombinations_reset(){
	for(var i = 0; i < 9; i++){
		document.images["imgComb" + i].src = this.combinations[i].src;
	}
}

function PokerCombinations_draw(){
	if(this.combinations == null || this.selectedCombinations == null){
		alert("Error: Interface not initialized!");
		return;
	}
	var outStr = "\n<table>";	
	for(var i = 8; i >=0; i--){
		outStr += '\n\t<tr><td><img name="imgComb' + i + '" src="images/poker/p0' + i + '.gif" alt="' + this.combNames[i] + '" width="199" height="20"></td></tr>';
	}
	outStr += "\n</table>";
	document.write(outStr);
}

function PokerCombinations_select(index){
	this.reset();
	document.images["imgComb" + index].src = this.selectedCombinations[index].src;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function UserPointsPanel(){
	this.draw = UserPointsPanel_draw;
}

function UserPointsPanel_draw(){
	var outStr = '\n<table width="100%">'
		+ '\n\t<tr><td><font face="Courier New"><b>Credit:&nbsp;&nbsp; </b></font><input type="text" size="8" name="txtUserCredit" value="1" onFocus="this.blur();"></td></tr>'
		+ '\n\t<tr><td><font face="Courier New"><b>User Bet: </b></font><input type="text" size="4" name="txtUserBet" value="1" onFocus="this.blur();">&nbsp;<input type="button" name="btnBetL" value="&lt;" onClick="decrementBet();"><input type="button" name="btnBetG" value="&gt;" onClick="incrementBet();"></td></tr>'
		+ '\n</table>';	
	document.write(utils.makeHtmlBox(outStr,"#87CEEB"));
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ButtonPanel(){
	this.draw = ButtonPanel_draw;
}

function ButtonPanel_draw(){
	outStr = '\n<table width="100%">'
		+ '<tr><td align="left"><input type=button name="btnSettings" value="Settings" onClick="showSettings();"></td>'
		+ '<td align="right"><font face="Courier New"><b>Game Result: </b></font><input type=text name="txtResult" value="" size ="40" onFocus="this.blur();"></td>'
		+ '<td  align="right"><input type=button name="btnNext" value="Next &gt;&gt;" onClick="handleNext()"></td></tr>'
		+ '</table>';
	document.writeln(utils.makeHtmlBox(outStr,"#87CEEB"));
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Utils(){
	this.makeHtmlBox = Utils_makeHtmlBox;
	this.getBoxStart = Utils_getBoxStart;
	this.getBoxEnd = Utils_getBoxEnd;
}

function Utils_makeHtmlBox(htmlStr, backColor, borderColor){
	var boc = "#000000";
	var bac = "#ffffff";
	var html = "&nbsp;";

	if(borderColor) boc = borderColor; 
	if(backColor) bac = backColor;
	if(htmlStr) html = htmlStr;

	return this.getBoxStart(boc, bac) + html + this.getBoxEnd();
}

function Utils_getBoxStart(borderColor, backColor, pad){
	var cpad = "1";
	if(pad) cpad = pad;
	var boxStart = '<table cellspacing=0 cellpadding=2 border=0 width="100%">'
		+ '<tr><td align=center bgcolor="' + borderColor + '">'
		+ '<table cellspacing=0 cellpadding=' + cpad + ' border=0 width="100%" >'
		+ '<tr><td align=center bgcolor="' + backColor + '">';
	return boxStart;
}

function Utils_getBoxEnd(){
	var boxEnd = '</td></tr>'
		+ '</table>'
		+ '</td></tr>'
		+ '</table>';
	return boxEnd;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////