//---------------------------------------------------------//
// Poker                                             //
//                                                         //
// (c) Copyright by Vasian CEPA 2001. All rights reserved. // 
// email: @                                 //
//---------------------------------------------------------//

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var suit = new Suit();
var aCard = new Card(1, suit.S_CLUBS, null);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Suit(){
	this.suit = new Array(0,1,2,3);

	this.S_CLUBS = 0;
	this.S_DIAMONDS = 1;
	this.S_HEARTS = 2;
	this.S_SPADES = 3;
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Card(aNum, aSuit, aImg){
	this.number = aNum;
	this.suit = aSuit;
	this.img = aImg;

	this.cardNames = new Array("-", "-", "2","3","4","5","6","7","8","9","10","J","Q","K","A");

	this.D_JACK = 11;
	this.D_QUEEN = 12;
	this.D_KING = 13;
	this.D_ACE = 14;

	this.toString = Card_toString;
}

function Card_toString(){
	var si = (this.img == null || this.img.src == null) ? "" : this.img.src ;
	return "[" + this.number + " " + this.suit + " " + si + "]";
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Deck(){
	this.pointer = 0;
	this.deck = null;

	this.init = Deck_init;
	this.shuffle = Deck_randomize;
	this.nextDeckCard = Deck_nextDeckCard;
}

function Deck_init(){
	this.deck = new Array(52);
	this.pointer = 0;
	for(var i = 2; i < 15; i++){
		var imgSrc = "images/cards/";
		switch(i){
		case 10:
			imgSrc += "t";
			break;
		case 11:
			imgSrc += "j";
			break;
		case 12:
			imgSrc += "q";
			break;
		case 13:
			imgSrc += "k";
			break;
		case 14:
			imgSrc += "a";
			break;
		default:
			imgSrc += new Number(i).toString();
			break;
		}

		var tt = 4*i - 8;
		for(var ii = 0; ii <= 3; ii++){
			imgSrcTemp = imgSrc;
			switch(ii){
			case 0:
				imgSrcTemp += "c";
				break;
			case 1:
				imgSrcTemp += "d";
				break;
			case 2:
				imgSrcTemp += "h";
				break;
			case 3:
				imgSrcTemp += "s";
				break;
			}
			var im = new Image();
			im.src = imgSrcTemp + ".gif";
			this.deck[tt + ii] = new Card(i, suit.suit[ii], im);
		}
	}
}

function Deck_randomize(){
	if(this.deck == null) return;
	this.pointer = 0;
	for(var i = 0; i < 52; i++){
		var selectOne = Math.floor(51*Math.random() + 1);
		var temp = this.deck[i];
		this.deck[i] = this.deck[selectOne];
		this.deck[selectOne] = temp;				
	}
}

function Deck_nextDeckCard(){
	if(this.deck == null) return null;
	if(this.pointer > 51){
		this.shuffle();
	}
	return this.deck[this.pointer++];
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function cardCompare(card1, card2){
	return card1.number - card2.number;
}

function poker(c){
	var result = new handCombination();

	if(c == null) return result; //C_NONE is default;

	var cCopy = new Array(5);

	for(var i = 0; i < 5; i++){
		cCopy[i] = c[i];
	}
	cCopy.sort(cardCompare);

	// number combinations
	var antePreviousMatch = false, previousMatch = false, three = false, four = false, possibleFull = 0;
	for(var i = 1; i < 5; i++){
		var remberHighCard = -2;
		if(cCopy[i].number == cCopy[i-1].number){
			if(antePreviousMatch){
				four = true;
				antePreviousMatch = false;
				three = false;
				result.holdArray[i] = true;
				result.highCard = cCopy[i].number;
				break;
			} else if(previousMatch){
				three = true;
				antePreviousMatch = true;
				previousMatch = false;
				possibleFull--;
				result.holdArray[i] = true;
				result.highCard = cCopy[i].number;
			} else {
				previousMatch = true;
				result.holdArray[i] = true;
				result.holdArray[i-1] = true;
				possibleFull++;

				if(remberHighCard < cCopy[i].number){
					if(!three)
						remberHighCard = result.highCard = cCopy[i].number;
				}
			}
		} else {
			antePreviousMatch = previousMatch = false;
		}
	}	
	
	// straight
	var straight = true;
	for(var i = 1; i < 5; i++){
		if(cCopy[i].number - cCopy[i-1].number != 1){
     			if(i == 4){
				if(cCopy[4].number == aCard.D_ACE && cCopy[0].number == 2){
					continue;
				}
			}
			straight = false;
			break;
		}
	}

	// suit combinatination
	var flush = true;
	for(var i = 1; i < 5; i++)
	     if((cCopy[i].suit - cCopy[i-1].suit) != 0 ) flush = false;

	// result combinations
	while(true){
		if(flush && straight){
			result.holdArray = new Array(true,true,true,true,true);
			if(cCopy[4].number == aCard.D_ACE && cCopy[3].number == aCard.D_KING){
				result.combination = result.C_ROYAL_FLUSH;
			} else {
				result.combination = result.C_STRAIGHT_FLUSH;	
			}

			if(cCopy[4].number == aCard.D_ACE && cCopy[0].number == 2) result.highCard = cCopy[3].number;
			else result.highCard = cCopy[4].number;
			break;

		} else if(four){
			result.combination = result.C_FOUR;
			break;
		} else if(three && (possibleFull > 0)){
			result.combination = result.C_FULL;
			break;
		} else if(flush){
			result.holdArray = new Array(true,true,true,true,true);
			result.combination = result.C_FLUSH;
			break;
		} else if(straight){
			result.holdArray = new Array(true,true,true,true,true);
			result.combination = result.C_STRAIGHT;

			if(cCopy[4].number == aCard.D_ACE && cCopy[0].number == 2) result.highCard = cCopy[3].number;
			else result.highCard = cCopy[4].number;
			break;
		} else if(three){
			result.combination = result.C_THREE;
			break;
		} else if(possibleFull == 2){
			result.combination = result.C_TWO_PAIR;
			break;
		} else if(possibleFull > 0){
			result.combination = result.C_PAIR;
			break;
		} else { // none
			result.highCard = cCopy[4].number;
			break;
		}
		break; // we ensure we get out of loop here
	}

	// re-arrange hold array based on orriginal card c array worder
	var newHoldArray = new Array(false,false,false,false,false);

	var holdCount = 0;
	for(var i = 0; i < 5; i++){
		if(result.holdArray[i]){
			holdCount++;
			for(var j = 0; j < 5; j++)
				if((cCopy[i].number == c[j].number) && (cCopy[i].suit == c[j].suit))
					newHoldArray[j] = true;
		}
	}

	// make sure at least two cards are selected to be holded, even if result is C_NONE;
	switch(holdCount){
	case 0:
		var index = Math.floor(5.0*Math.random());
		var newIndex = -1;
		do{
			newIndex = Math.floor(5.0*Math.random());
		}while(newIndex == index);

		newHoldArray[index] = true;
		newHoldArray[newIndex] = true;
		break;
	case 1: // should never be 1, but to be sure
		alert("ASSERT: holdCount failed at poker.js");
		/*
		for(var i = 0; i < 5; i++){
			if(!result.newHoldArray[i]){
				result.newHoldArray[i] = true;
				break;
			}
		}
		*/
		break;
	}

	result.holdArray = newHoldArray;
	return result;	
}


// "Pair","Two Pair","Three of a Kind","Straight","Flush","Full House","Four of a Kind","Straight Flush","Royal Flush"
// Ref: http://www.pokerpages.com/pokerinfo/rank/index.htm
function handCombination(){
	this.C_NONE = -1;
	this.C_PAIR = 0;
	this.C_TWO_PAIR = 1;
	this.C_THREE = 2;
	this.C_STRAIGHT = 3;
	this.C_FLUSH = 4;
	this.C_FULL = 5;
	this.C_FOUR = 6;
	this.C_STRAIGHT_FLUSH = 7;
	this.C_ROYAL_FLUSH = 8;

	this.combination = this.C_NONE;
	this.highCard = -1;
	this.holdArray = new Array(false, false, false, false, false);
}