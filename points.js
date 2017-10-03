//---------------------------------------------------------//
// Poker                                             //
//                                                         //
// (c) Copyright by Vasian CEPA 2001. All rights reserved. // 
// email: @                                 //
//---------------------------------------------------------//

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Points(){
	this.userCredit = 1;
	this.compCredit = 0;
	this.userBet = 1;
	this.compBet = 1;

	this.cookieName = "vwebPoker";
	this.prob = new ProbabilityCoeficients();

	this.init = Points_init;
	this.reset = Points_reset;
	this.serialize = Points_serialize;
	this.restore = Points_restore;
	this.refreshData = Points_refreshData;

	this.setUserCredit = Points_setUserCredit;
	this.setCompCredit = Points_setCompCredit;

	this.changeCreditWith = Points_changeCreditWith;
	this.gameOver = Points_gameOver;

	this.incrementUserBet = Points_incrementUserBet;
	this.decrementUserBet = Points_decrementUserBet;
	this.incrementCompBet = Points_incrementCompBet;
	this.decrementCompBet = Points_decrementCompBet;

	this.setCookie = Points_setCookie;
	this.getCookie = Points_getCookie;
	this.deleteCookie = Points_deleteCookie;
}

function Points_init(){
	this.userBet = 1;
	this.compBet = 1;
	if(!this.restore()){
		this.userCredit = 100;
		this.compCredit = 0;
		this.serialize();
		if(!this.restore()){
			alert("Error: Could not write cookie!");
		}
	}
}

function Points_reset(){
	this.init();
	this.refreshData();
}

function Points_serialize(){
	var data = this.userCredit + "!" + this.compCredit + "!" + this.prob.toString();
	//alert(data);
 	this.setCookie(data);
}

function Points_restore(){
	var data = this.getCookie();
	if(data == null) return false; // no previous results
	var dataArray = data.split("!");

	this.userCredit = parseInt(dataArray[0]); 
	this.compCredit = parseInt(dataArray[1]);
	this.prob.fromString(dataArray[2]);
	return true; 
}

function Points_refreshData(){
	var form = document.handForm;
	form.txtUserCredit.value = this.userCredit;
	form.txtUserBet.value = this.userBet;
	form.txtCompBet.value = this.compBet;
}

function Points_setCookie(data){
	var today = new Date();
	var sExpires = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // plus 30 days
	var c = ( this.cookieName + "=" + escape(data) +
	( (sExpires) ? "; expires=" + sExpires.toGMTString()  : "" )     );
	document.cookie = c;
}

function Points_getCookie(){
	var dc = document.cookie;
	var prefix = this.cookieName + "=";
	var begin = dc.indexOf("; " + prefix);
	if (begin == -1) {
		begin = dc.indexOf(prefix);
		if (begin != 0) return null;
	} else begin += 2;

	var end = document.cookie.indexOf(";", begin);
	if (end == -1)
	end = dc.length;
	return unescape(dc.substring(begin + prefix.length, end));
}

function Points_deleteCookie(){
	if (this.getCookie(this.cookieName)) {
		document.cookie = this.cookieName + "=" + 
		"; expires=Thu, 01-Jan-70 00:00:01 GMT";
	}
}

function Points_changeCreditWith(delta){
	if(this.gameOver()) return;
	// if user wins delta is > 0 else if comp wins delta is < 0
	//alert("SUMC0: " + (this.userCredit + this.compCredit) + "-"); 
	this.setUserCredit((parseInt(this.userCredit) + parseInt(delta))); 
	this.setCompCredit((parseInt(this.compCredit) - parseInt(delta)));
	//alert("SUMC1: " + (this.userCredit + this.compCredit)); 
}

function Points_gameOver(){
	if(this.userCredit < this.userBet){
		alert("\t!!! GAME OVER !!!\n\n\t(Credit lower than bet!)\n\n\n  $$$---> ENTER NEW CREDIT! <---$$$\n\n--------------------------\nV-Web Poker (c) - 2001 by Vasian CEPA.\n@");
		return true;
	} 
	return false;
}

function Points_setUserCredit(newCredit){
	var nc = 1;
	if(typeof(newCredit) != "number"){
		nc = parseInt(newCredit);
		if(isNaN(nc)) return;
	} else nc = newCredit;

	if(nc < 0){
		alert("Warning: Credit is negative.\nUsing absolute value!");
	}
	nc = Math.floor(Math.abs(nc));
	//if(nc < this.userBet){
	//	alert("Credit cannot be smaller than Bet");
	//	return false;
	//}

	this.userCredit = nc;
	this.serialize();
	this.refreshData();
}

function Points_setCompCredit(newCredit){
	var nc = 1;
	if(typeof(newCredit) != "number"){
		nc = parseInt(newCredit);
		if(isNaN(nc)) return;
	} else nc = newCredit;
	this.compCredit = Math.floor(nc);
	this.serialize();
}

function Points_decrementUserBet(pot){
	var ib = 1;
	if(pot) ib = pot;
	if((this.userBet - ib) >= 1) this.userBet -= ib;
	else{
		alert("Bet can not be smaller than 1");
		return;
	}
	this.refreshData();
}

function Points_incrementUserBet(pot){
	var ib = 1;
	if(pot) ib = pot;
	if((this.userBet + ib) <= this.userCredit) this.userBet += ib;
	else{
		alert("Bet can not be greater than your credit!");
		return;
	}
	this.refreshData();
}

function Points_decrementCompBet(pot){
	var ib = 1;
	if(pot) ib = pot;
	if((this.compBet - ib) >= 1) this.compBet -= ib;
	else{
		return;
	}
	this.refreshData();
}

function Points_incrementCompBet(pot){
	var ib = 1;
	if(pot) ib = pot;
	// userCredit is left intentionaly here in test
	//if(this.compBet < this.userCredit) this.compBet += ib;
	//else{
	//	return;
	//}
	this.compBet += ib; // this may burn up the user!!!
	this.refreshData();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var DEFAULT_PROBS = new ProbabilityCoeficients();

function ProbabilityCoeficients(){
	// default

	this.dclass1FollowFirstAdd = 0.01;
	this.dclass1FollowSecondAdd = 0.4;

	this.dclass2FollowFirstAdd = 0.2;
	this.dclass2FollowSecondAdd = 0.8;

	this.dclass3FollowFirstAdd = 0.6;
	this.dclass3FollowSecondAdd = 0.8;

	this.dclass4FollowFirstAdd = 0.99;
	this.dclass4FollowSecondAdd = 1;

	this.dclass1AddBet1 = 1;
	this.dclass1AddBet2 = 0.1;

	this.dclass2AddBet1 = 0.1
	this.dclass2AddBet2 = 1;

	this.dclass3AddBet1 = 0.2;
	this.dclass3AddBet2 = 0.06;

	// working copy
	this.class1FollowFirstAdd = this.dclass1FollowFirstAdd;
	this.class1FollowSecondAdd = this.dclass1FollowSecondAdd;

	this.class2FollowFirstAdd = this.dclass2FollowFirstAdd;
	this.class2FollowSecondAdd = this.dclass2FollowSecondAdd;

	this.class3FollowFirstAdd = this.dclass3FollowFirstAdd;
	this.class3FollowSecondAdd = this.dclass3FollowSecondAdd;

	this.class4FollowFirstAdd = this.dclass4FollowFirstAdd;
	this.class4FollowSecondAdd = this.dclass4FollowSecondAdd;

	this.class1AddBet1 = this.dclass1AddBet1;
	this.class1AddBet2 = this.dclass1AddBet2;

	this.class2AddBet1 = this.dclass2AddBet1;
	this.class2AddBet2 = this.dclass2AddBet2;

	this.class3AddBet1 = this.dclass3AddBet1;
	this.class3AddBet2 = this.dclass3AddBet2;

	this.separator = "^";

	this.toString = ProbabilityCoeficients_toString;
	this.fromString = ProbabilityCoeficients_fromString;
}

function ProbabilityCoeficients_toString(){
	var str = "";
	str +=    this.class1FollowFirstAdd + this.separator
		+ this.class1FollowSecondAdd + this.separator
		+ this.class2FollowFirstAdd + this.separator
		+ this.class2FollowSecondAdd + this.separator
		+ this.class3FollowFirstAdd + this.separator	
		+ this.class3FollowSecondAdd + this.separator
		+ this.class4FollowFirstAdd + this.separator
		+ this.class4FollowSecondAdd + this.separator
		+ this.class1AddBet1 + this.separator
		+ this.class1AddBet2 + this.separator
		+ this.class2AddBet1 + this.separator
		+ this.class2AddBet2 + this.separator
		+ this.class3AddBet1 + this.separator
		+ this.class3AddBet2;

	
	//alert("ProbabilityCoeficients_toString: " +  str);
	return str;
}

function ProbabilityCoeficients_fromString(str){
	var v = new String(str).split(this.separator);
	var index = -1, i = null;

	i = parseFloat(v[++index]);
	this.class1FollowFirstAdd = ((isNaN(i)) ? this.dclass1FollowFirstAdd : i);
	i = parseFloat(v[++index]);
	this.class1FollowSecondAdd = ((isNaN(i)) ? this.dclass1FollowSecondAdd : i);
	i = parseFloat(v[++index]);
	this.class2FollowFirstAdd = ((isNaN(i)) ? this.dclass2FollowFirstAdd : i);
	i = parseFloat(v[++index]);
	this.class2FollowSecondAdd = ((isNaN(i)) ? this.dclass2FollowSecondAdd : i);
	i = parseInt(v[++index]);
	this.class3FollowFirstAdd = ((isNaN(i)) ? this.dclass3FollowFirstAdd : i);
	i = parseFloat(v[++index]);
	this.class3FollowSecondAdd = ((isNaN(i)) ? this.dclass3FollowSecondAdd : i);
	i = parseFloat(v[++index]);
	this.class4FollowFirstAdd = ((isNaN(i)) ? this.dclass4FollowFirstAdd : i);
	i = parseFloat(v[++index]);
	this.class4FollowSecondAdd = ((isNaN(i)) ? this.dclass4FollowSecondAdd : i);

	i = parseFloat(v[++index]);
	this.class1AddBet1 = ((isNaN(i)) ? this.dclass1AddBet1 : i);
	i = parseFloat(v[++index]);
	this.class1AddBet2 = ((isNaN(i)) ? this.dclass1AddBet2 : i);
	i = parseFloat(v[++index]);
	this.class2AddBet1 = ((isNaN(i)) ? this.dclass2AddBet1 : i);
	i = parseFloat(v[++index]);
	this.class2AddBet2 = ((isNaN(i)) ? this.dclass2AddBet2 : i);
	i = parseFloat(v[++index]);
	this.class3AddBet1 = ((isNaN(i)) ? this.dclass3AddBet1 : i);
	i = parseFloat(v[++index]);
	this.class3AddBet2 = ((isNaN(i)) ? this.dclass3AddBet2 : i);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////