//---------------------------------------------------------//
// Poker                                             //
//                                                         //
// (c) Copyright by Vasian CEPA 2001. All rights reserved. // 
// email: @                                 //
//---------------------------------------------------------//

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var DEBUG = false;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function GameLogic(){
	this.userMinHold = 0;
	this.compMinHold = 0;
	//this.NEXT = "Get Next Hand >>";
	//this.CHANGE = "Draw (Change) Cards";
	this.USER_ID = "user";
	this.COMP_ID = "comp";


	this.gameState = new GameState(this);
	
	this.cardSource = new CardSource();
	this.userHand = new CardsHand(this.USER_ID);
	this.compHand = new CardsHand(this.COMP_ID);
	this.pCombinations = new PokerCombinations();
	this.userPoints = new UserPointsPanel();
	this.buttons = new ButtonPanel();
	this.points = new Points();
	
	this.computer = new ComputerReason(this);

	this.init = GameLogic_init;
	this.reset = GameLogic_reset;
	this.checkHold = GameLogic_checkHold;
	this.handleNext = GameLogic_handleNext;
	this.showNext = GameLogic_showNext;
	this.changeCards = GameLogic_changeCards;
	this.sameCard = GameLogic_sameCard;
	this.handEval = GameLogic_handEval;
	this.winProcedure = GameLogic_winProcedure;

	this.incrementUserBet = GameLogic_incrementUserBet;
	this.decrementUserBet =  GameLogic_decrementUserBet;
	this.about = GameLogic_about;
}

//------------------------------------------

function GameLogic_init(){
	window.status = "V-Web Poker Loading Images...";
	IMAGE_BACK.src = "images/cards/b.gif";
	IMG_USER_NORMAL = "images/misc/uface.gif";
	IMG_USER_HAPPY = "images/misc/uface-happy.gif";
	IMG_USER_SAD = "images/misc/uface-sad.gif";

	this.cardSource.init();
	this.pCombinations.init();
	this.points.init();
	window.status = "Done!";
}

function GameLogic_reset(){
	this.cardSource.reset();
	this.points.reset();
	this.gameState.reset();	
	document.handForm.btnNext.focus();
}

//------------------------------------------

function GameLogic_checkHold(number, src){
	var sourcePatterns = new Array("internal", "img", "chkHold"); // three ways to change checkhold status
	var S_INTER = 0, S_IMG = 1, S_CHK = 2;
	var source = S_INTER; // default
	var sTarget = this.COMP_ID;

	// 1. find the source and target of this function call
	if(src.indexOf(this.USER_ID) != - 1) sTarget = this.USER_ID;
	if(src.indexOf(sourcePatterns[S_CHK]) != - 1)
		source = S_CHK;
	else if(src.indexOf(sourcePatterns[S_IMG]) != - 1)
		source = S_IMG;

	var chkName = "chkHold" + number + "_" + sTarget;
	var imgName = "img" + number + "_" + sTarget;

	// 2. remember previous select state
	var chkHold = document.handForm.elements[chkName];
	var previousStatus = chkHold.checked;

	//alert("CHK: " + number + " " + src + " " + sTarget + " " + sourcePatterns[source] + " state: " + this.gameState.state);

	// 3. ignore this action and set corresponding chekbox to false on these cases:
	if(
		((source == S_INTER) && (this.gameState.state == this.gameState.S_CHANGE_CARDS) && sTarget == this.COMP_ID) ||
		((source != S_INTER) && (sTarget == this.COMP_ID)) ||
		((source != S_INTER) && (document.images[imgName].src == IMAGE_BACK.src))
	){
		if(source == S_CHK) chkHold.checked = !chkHold.checked;
		return;
	}

	//4. special call case care when checkboxes are the source
	var chkOn = false;
	if(source == S_CHK){
		previousStatus = !previousStatus;
		chkOn = true;
	}
	
	//alert("m: " + this.minHold + " " + previousStatus);

	//5. change/check minHold

	mh = ((sTarget == this.USER_ID) ? this.userMinHold : this.compMinHold);

	switch(previousStatus){
	case true:
		if(mh <= 2){
			if(chkOn) 
				chkHold.checked = true;
			return;
		} else {
			mh--;
		}
		break;
	case false:
		mh++;
		break;
	}
	
	((sTarget == this.USER_ID) ? this.userMinHold = mh : this.compMinHold = mh);

	//6. if arrived till here change state
	chkHold.checked = !previousStatus;
}

//------------------------------------------

function GameLogic_showNext(){
	var cards_copy = new Array(10);
	for(var i = 0; i < 5; i++){
		cards_copy[i] = this.userHand.cards[i];
		cards_copy[i + 5] = this.compHand.cards[i];
	}
	this.changeCards(this.COMP_ID, cards_copy);
	this.changeCards(this.USER_ID, cards_copy);
}

function GameLogic_changeCards(sTarget, cards_copy){
	var cards = null;
	if(sTarget == this.USER_ID){
		this.userMinHold = 0;
	} else {
		this.compMinHold = 0;
	}

	for(var i = 1; i <= 5; i++){
		var chkName = "chkHold" + i + "_" + sTarget;
		var imgName = "img" + i + "_" + sTarget;

		var holdStatus = document.handForm.elements[chkName].checked; 
		if(holdStatus){
			document.handForm.elements[chkName].checked = !holdStatus; 
			continue;
		}
	
		var card = null;
		do{
			card = this.cardSource.deck.nextDeckCard();
			if(card == null){
				alert("Error: Deck has not been initialized!");
				return;
			}
		} while(this.sameCard(cards_copy, card));
		if(sTarget == this.USER_ID){
			document.images[imgName].src = card.img.src;
			this.userHand.cards[i-1] = card;
		} else {
			if(DEBUG) document.images[imgName].src = card.img.src;
			this.compHand.cards[i-1] = card;
		}
	}
}

function GameLogic_sameCard(cards_copy, c){
	// new working copy compare
	for(var j = 0; j < 5; j++){
		if((this.compHand.cards[j] != null) && (this.compHand.cards[j].number == c.number) && (this.compHand.cards[j].suit == c.suit))
			return true;
	}
	for(var j = 0; j < 5; j++){
		if((this.userHand.cards[j] != null) && (this.userHand.cards[j].number == c.number) && (this.userHand.cards[j].suit == c.suit))
			return true;
	}

	// previous copy compare
	for(var j = 0; j < 10; j++){
		if((cards_copy[j] != null) && (cards_copy[j].number == c.number) && (cards_copy[j].suit == c.suit))
			return true;
	}
	return false;
}

function GameLogic_handleNext(){
	this.gameState.setNextState();
}

function GameLogic_handEval(c, sTarget){
	var result = poker(c);
	var cIndex = result.combination;
	if(sTarget == this.USER_ID){
		if(cIndex >= 0){
			this.pCombinations.select(cIndex);	
		} else {
			this.pCombinations.reset();
		}
	}

	if(sTarget == this.USER_ID){
		this.userMinHold = 0;
	} else {
		this.compMinHold = 0;
	}

	for(var i = 0; i < 5; i++){
		var chkName = "chkHold" + (i + 1) + "_" + sTarget;
		document.handForm.elements[chkName].checked = false;
		if(result.holdArray[i]){
			checkHold(i + 1, "internal_" + sTarget);
		}
	}
	return result;
}

function GameLogic_winProcedure(compResult, userResult){
	var msg = "";
	var userWins = "YOU WIN WITH: ";
	var compWins = "COMPUTER WINS WITH: "

	var W_COMP = 0; W_USER = 1; W_NONE = 2;
	var winner = W_NONE;	
	var delta = 0;

	if(this.points.compBet > this.points.userBet){
		msg = compWins + "!!!bluff!!!";
		delta = this.points.userBet;
		winner = W_COMP;
	} else if(this.points.compBet < this.points.userBet){
		msg = userWins + "!!!bluff!!!";
		delta = this.points.compBet;
		winner = W_USER;
	} else {
		delta = this.points.userBet;
		for(var i = 1; i <= 5; i++){
			document.images["img" + i + "_" + this.COMP_ID].src = this.compHand.cards[i-1].img.src;
		}
		if(compResult.combination > userResult.combination){
			msg = compWins + this.pCombinations.combNames[compResult.combination];
			winner = W_COMP;
		} else if (compResult.combination == userResult.combination) {
			msg = "CHOP! - NO ONE LOSES!"
			delta = 0;
			if(compResult.combination != compResult.C_NONE){ // see if high card can unset this result
				if(compResult.highCard > userResult.highCard){
					winner = W_COMP;
					delta = this.points.userBet;
					msg = compWins + "[high card (" + aCard.cardNames[compResult.highCard] + ")] " + this.pCombinations.combNames[compResult.combination];
				} else if(compResult.highCard < userResult.highCard){
					winner = W_USER;
					delta = this.points.userBet;
					msg = userWins + "[high card (" + aCard.cardNames[userResult.highCard] + ")] " + this.pCombinations.combNames[userResult.combination];
				} else {
					msg += " (same high card)"; 
				}
			}
		} else {
			msg = userWins + this.pCombinations.combNames[userResult.combination];
			winner = W_USER;
		}
	}

	
	if(winner == W_COMP){
		document.images["imgUser"].src = IMG_USER_SAD;
		delta = -delta;
	} else if(winner == W_USER){
		document.images["imgUser"].src = IMG_USER_HAPPY;
	}
	this.points.changeCreditWith(delta);
	document.handForm.txtResult.value = msg;
}

//------------------------------------------

function GameLogic_incrementUserBet(){
	if(this.gameState.state == this.gameState.S_BLIND_BET){
		this.points.incrementUserBet();
		this.points.incrementCompBet();
		// save/reser state 0 data
		this.gameState.stateData.s0_userBet = this.points.userBet;
		this.gameState.stateData.s2_mustFollow = null;
	} else if(this.gameState.state == this.gameState.S_CHANGE_CARDS){
		if(this.points.userBet < (3*this.gameState.stateData.s0_userBet)) { // no more three times the initial pot
			this.points.incrementUserBet(this.gameState.stateData.s0_userBet);
			if(!this.gameState.stateData.s2_addCompBet){
				if(this.points.userBet == (2*this.gameState.stateData.s0_userBet)){ // first time
					this.gameState.stateData.s2_mustFollow = this.computer.followIncrement();
					if(this.gameState.stateData.s2_mustFollow){
						this.points.incrementCompBet(this.gameState.stateData.s0_userBet);
					}
				} else if(this.points.userBet == (3*this.gameState.stateData.s0_userBet)){ // second time
					if(this.gameState.stateData.s2_mustFollow){ // re-think
						this.gameState.stateData.s2_mustFollow = this.computer.followIncrement();
						if(this.gameState.stateData.s2_mustFollow){
							this.points.incrementCompBet(this.gameState.stateData.s0_userBet);
						}
					}
				}
			}
		}
	}
}

function GameLogic_decrementUserBet(){
	if(this.gameState.state == this.gameState.S_BLIND_BET){
		this.points.decrementUserBet();
		this.points.decrementCompBet();
	}
}

//------------------------------------------

function GameLogic_about(){
	alert("V-Web Poker\n\n(c) - Copyright 2001 by Vasian CEPA\n@");
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function GameState(parent){
	this.game = parent; // the game object
	this.stateNextLabel = new Array("1. Set blind bet", "2. Change Cards", "3. Increase Pot Bet", "4. Compare Result");
	this.S_BLIND_BET = 0;
	this.S_GET_CARDS = 1;
	this.S_CHANGE_CARDS = 2;
	this.S_COMPARE_RESULT = 3;

	this.state = this.S_BLIND_BET = 0;
	this.stateData = new StateData();


	this.init = GameState_init;
	this.reset = GameState_reset;
	this.setNextState = GameState_setNextState;
	this.setNewState = GameState_setNewState;
	this.setStateBlindBet = GameState_setStateBlindBet;
	this.setStateGetCards = GameState_setStateGetCards;
	this.setStateChangeCards = GameState_setStateChangeCards;
	this.setStateCompareResult = GameState_setStateCompareResult;
}

function GameState_init(){
	this.stateData.s0_userBet = this.game.points.userBet;
	this.setNewState(this.S_BLIND_BET);
}

function GameState_reset(){
	this.init();
}

function GameState_setNextState(){
	var newState = ((this.state == this.S_COMPARE_RESULT) ? this.S_BLIND_BET : ++this.state);
	this.setNewState(newState);
}

function GameState_setNewState(newState){
	document.handForm.txtGameState.value = this.stateNextLabel[newState];
	this.state = newState;

	if(newState == this.S_BLIND_BET){
		this.setStateBlindBet();
	} else if(newState == this.S_GET_CARDS){
		this.setStateGetCards();
	} else if(newState == this.S_CHANGE_CARDS){
		this.setStateChangeCards();
	} else if(newState == this.S_COMPARE_RESULT){
		this.setStateCompareResult();
	}
}

function GameState_setStateBlindBet(){
	this.game.points.userBet = this.stateData.s0_userBet;
	this.game.points.compBet = this.stateData.s0_userBet;
	this.game.points.refreshData();

	this.game.userHand.reset();
	this.game.compHand.reset();
	this.game.pCombinations.reset();

	this.game.userMinHold = 0;
	this.game.compMinHold = 0;

	document.handForm.txtResult.value = "";
	document.images["imgUser"].src = IMG_USER_NORMAL;
}

function GameState_setStateGetCards(){
	hideSettings();
	this.game.showNext();
	var compResult = this.game.handEval(this.game.compHand.cards, this.game.COMP_ID);
	var userResult = this.game.handEval(this.game.userHand.cards, this.game.USER_ID);
}

function GameState_setStateChangeCards(){
	this.game.showNext();
	var compResult = this.game.handEval(this.game.compHand.cards, this.game.COMP_ID);
	var userResult = this.game.handEval(this.game.userHand.cards, this.game.USER_ID);

	// code to decide if computer must increase its bet, based on compResult
	var nbc = this.game.computer.addBet(compResult);
	for(var i = 2; i <= nbc; i++){
		this.game.points.incrementCompBet(this.stateData.s0_userBet);
	}
}

function GameState_setStateCompareResult(){
	var compResult = this.game.handEval(this.game.compHand.cards, this.game.COMP_ID);
	var userResult = this.game.handEval(this.game.userHand.cards, this.game.USER_ID);
	this.game.pCombinations.reset();

	this.game.winProcedure(compResult, userResult);
	this.userBet
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function StateData(){
	this.s0_userBet = 1;
	this.s2_mustFollow = null;
	this.s2_addCompBet = false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ComputerReason(parent){
	this.game = parent;
	this.state = this.game.gameState;

	this.prob = this.game.points.prob;

	// The contstants found these functions
	// affect Computer Player side behaviour during a game.
	this.followIncrement = ComputerReason_followIncrement;
	this.addBet = ComputerReason_addBet;
}

function ComputerReason_followIncrement(){
	var mustFollow = false;
	var compResult = poker(this.game.compHand.cards);
	var r = Math.random();

	if(compResult.combination <= compResult.C_NONE){
		if(this.game.points.useBet > (2*this.state.stateData.s0_userBet)){
			if(r <= this.prob.class1FollowFirstAdd) mustFollow = true;
		} else {
			if(r <= this.prob.class1FollowSecondAdd) mustFollow = true;
		}	
	} else if(compResult.combination >=compResult.C_PAIR && compResult.combination <= compResult.C_TWO_PAIR){
		if(this.game.points.useBet > (2*this.state.stateData.s0_userBet)){
			if(r <= this.prob.class2FollowFirstAdd) mustFollow = true;
		} else {
			if(r <= this.prob.class2FollowSecondAdd) mustFollow = true;
		}	
	} else if((compResult.combination >= compResult.C_THREE) && (compResult.combination <= compResult.C_FLUSH)){
		if(this.game.points.useBet > (2*this.state.stateData.s0_userBet)){
			if(r <= this.prob.class3FollowFirstAdd) mustFollow = true;
		} else {
			if(r <= this.prob.class3FollowSecondAdd) mustFollow = true;
		}	
	} else if(compResult.combination > compResult.C_FLUSH){
		if(this.game.points.useBet > (2*this.state.stateData.s0_userBet)){
			if(r <= this.prob.class4FollowFirstAdd) mustFollow = true;
		} else {
			if(r <= this.prob.class4FollowSecondAdd) mustFollow = true;
		}	
  	}
	return mustFollow;
}

function ComputerReason_addBet(compResult){
	var newCompBetCoef = 1;
	var r = Math.random();

	if(compResult.combination >= compResult.C_STRAIGHT){
		if(r <= this.prob.class1AddBet1)
			newCompBetCoef = 2;
		if(r <= this.prob.class1AddBet2)
			newCompBetCoef = 3;
		if(compResult.combination > compResult.FULL){
			if(r <= this.prob.class2AddBet2) // note AddBet2
				newCompBetCoef = 3;
			if(r <= this.prob.class2AddBet1)
				newCompBetCoef = 2;
		}
	} else { // pair or nothing
		if(r <= this.prob.class3AddBet1)
			newCompBetCoef = 2;
		if(r <= this.prob.class3AddBet2)
			newCompBetCoef = 3;
	}

	// in end
	if(newCompBetCoef > 1){
		this.state.stateData.s2_addCompBet = true;
	}
	return newCompBetCoef;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
