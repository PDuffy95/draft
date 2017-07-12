/************************************************DRAFT**************************************************************
What this program does:
The purpose of this program is to create a tool to allow for detailed and organized planning of all possible situations
an NBA team can encounter during the draft. The point is to account for the unknown of what other teams will do by
allowing the team to analyze all possibilities by branching the tree. It's easier for teams to just make a board
ranking all the draftees and then just picking the one highest on your board who is available, but this isn't always
ideal. You might want to take a different player based on who you have taken with your other picks or based on what
you think another team will pick. Also, this provides a great illustration for you to see what likely results will be;
it's like having all the mock drafts in one place.


How the code is organized:
The code is divided into five sections, which will eventually be in separate files. Before each section there is a
description of what the section holds and a description of what each method (or global variable) does. Before each
function, there is another paragraph with detailed explanation of how that function works.
******************************************************************************************************************/













/*************************************************GLOBAL VARIABLES************************************************
***These are the variables accessed by the functions.***

teamSlotArray: This array hold all the teamSlots. A team slot represents one node in the tree. This is the foundation
    for the entire application. Each teamSlot has an id, and that id is its index in the array, so it can be accessed
    easily. The teamSlot at entry 0 is 'invisible' since it is not drawn; it is the head node. This array holds
    all information needed to draw the tree.
numPicks: How many picks into the draft we want to simulate.
states: Array which holds past copies of the teamSlotArray that can be reverted to through the undo button.
undoneStates: When undo is hit, the CURRENT state (meaning state at time the button is hit) is added to this array.
    This allows the redo button to work.
playerNames:
playerPositions:
players: Holds the player objects for all players who can be selected in the draft.
teamNames: Holds the team names for the team in the draft, in order of their pick. i.e. first team name has first pick
    in the draft, second name has second pick, etc.
*****************************************************************************************************************/


//
var teamSlotArray = [];
//
var numPicks = 10;//should be hardcoded to 60 when done//////////////////////////////////////////////
//
var states = [];
//
var undoneStates = [];

//Player information for making the player objects
playerNames = ["Fultz","Ball","Jo-Jackson","Tatum","Fox","Isaac","Markannen","Ntilikina","Smith-Jr.","Z-Collins","Monk",
"Kennard","Mitchell","Adebayo","Ju. Jackson","Patton","Wilson","Leaf","J.-Collins","Giles","Ferguson","Allen","Anunoby",
"Lydon","Pasecniks","Swanigan","Kuzma","Bradley","White","Hart","F. Jackson","Reed","Iwundu","Mason III","Rabb"];
playerPositions = ["PG","PG","SF","SF","PG","SF/PF","PF","PG","PG","PF/C"];
players = [];

//
var teamNames = ["Sixers","Lakers","Celtics","Suns","Kings","Magic","Timberwolves","Knicks","Mavericks","Trail Blazers",
"Hornets","Pistons","Jazz","Heat","Kings","Bulls","Bucks","Pacers","Hawks","Kings","Thunder","Nets","Raptors",
"Nuggets","76ers","Trail Blazers","Lakers","Jazz","Spurs","Lakers"];
//var teamNames = ["Sixers","Lakers","Celtics","Suns","Kings"];

/*****************************************************************************************************************/








/**************************************************SETUP FUNCTIONS**************************************************
***These are the functions that are called to setup up the variables so they can be drawn, and also includes***
***the function which is actually used to draw them***

createPlayers(): Creates the player objects from the information in the various hardcoded arrays of player data.
createTeamSlots(): Creates the initial teamSlot objects and puts them in teamSlotArray. It creates the head node
    plus one teamSlot for each pick this draft is simulating. Gives them their parents, children, and available
    player arrays.
drawNumPicksSelect(): This adds the select dropdown to the top of the page which allows you to change the number of
    picks the draft is simulating.
redraw(): Removes the stuff attached to some hardcoded divs in the index.scala.html file then calls for the head node
    to drawSelf(), which is a recursive function which will cause the whole thing to be drawn. Also adds undo and
    redo buttons to a different hardcoded div.
*******************************************************************************************************************/


//Player object is defined in Player.js. Right now it only has two pieces of information, although more will probably
//be added later. For each name in the playerNames array, a player object is created using playerNames and
//playerPositions and added to the end of the players array.
function createPlayers(){
    for(var i=0;i<playerNames.length;i++){
        players[players.length]=(new Player(i,playerNames[i],playerPositions[i]));
    }
}


//Creates hierarchy of TeamSlot nodes. Creates a team slot for each team from the teamNames array in order. Make the
//previous one the parent and next one the child. Head node does not represent actual pick, but since we could branch
//at the first pick we need an invisible node that could point to all the first picks. An iterator is used to hold the
//most recently created teamSlot. We need this information to assign the parents/children.
function createTeamSlots(){
    var head = new TeamSlot(0,"",null,players,teamSlotArray.length);
    teamSlotArray.push(head);

    var iterator = teamSlotArray[0];
    for(var i=0; i<numPicks; i++){
        var tempTS = new TeamSlot(i+1,teamNames[i],iterator.id,players,teamSlotArray.length);
        teamSlotArray.push(tempTS);
        iterator.children[0]=tempTS.id;
        iterator=tempTS;
    }
}

//draws the dropdown which changes the number of teams. Attaches to div with id of 'options'.
function drawNumPicksSelect(){
   $('#options').append($('<select onChange=changeNumPicks(this.value)>'+
                                '<option value="" disabled selected>Choose Number of Picks to Simulate</option>'+
                                '<option value="5" >5</option>'+
                                '<option value="10" >10</option>'+
                                '<option value="30" >30</option>'+
                            '</select>'));
}


//There are some hardcoded divs in the body of theindex.scala.html file. The functions that draw things append to these
//divs (or other things inside of them). When changes are made, this function is called to just remove everything
//and then draw it all again. This is inefficient, but seems like it might be fast enough. Once the stuff is drawn
//to look good with d3 I might change how this is done. The teamSlots are added to the div with id 'teamDraftBoxes'
//and the undo and redo buttons are added to the div with id 'undoredo'.
function redraw(fromUndoOrRedo){
    if(!fromUndoOrRedo)
        undoneStates=[];
    $('#teamDraftBoxes').empty();
    $('#undoredo').empty();
    $('#options').empty();
    var alreadyDrawn = [];
    for(var i=0;i<teamSlotArray.length;i++)
        alreadyDrawn.push(0);
    teamSlotArray[0].drawSelf(alreadyDrawn);
    if(states.length>0)
        $('#undoredo').append($('<button onClick=undo()>undo</button>'));
    if(undoneStates.length>0)
        $('#undoredo').append($('<button onClick=redo()>redo</button>'));
    drawNumPicksSelect();
}

/************************************************************************************************************/





















/*******************************************CALLED FROM CLICK HELPER FUNCTIONS*************************************
***These functions are used by the called from click functions***

saveState(): Adds a copy of the current teamSlotArray to the states array so the undo button can work.
allPlayersMinusParentsTaken(teamSlot): Returns an array containing all the possible player who can be selected,
    minus those selected by parents of the teamSlot passed in.
reIndexTeamSlotArray(): Removes null elements from teamSlotArray and adjusts IDs to compensate.
checkArrayContentsEqual(a,b): Checks if a and b contain the same contents, even if order is different.
tryToConsolidate(): This function is called after a player is selected, and checks if any availablePlayer arrays
    at the same pick number are equal. It also checks if all picks made by its children are the same. If so, then
    it merges their children (aka has them point to the same child).
*******************************************************************************************************************/

//State holds a copy of the teamSlotArray (a copy is attained through the slice() function). Then, for each teamSlot in
//this copied array we replace the teamSlot with a copy of itself, so that a different object is stored so changes to
//the current teamSlots don't change the ones held in this array. At the end it checks states length and enforces a
//limit of holding only 20 moves.
function saveState(){
    var state = teamSlotArray.slice();
    for(var i=0; i<state.length;i++)
        state[i]=state[i].returnCopy();
    states.push(state);

    if(states.length>20)
        states.splice(0,1);
}

//Starts with a copy of the players array. Uses the passed in teamSlot as an iterator which moves up to the parent of
//the current teamSlot held in the teamSlot variable until it reaches the head node (which has id 0). At each teamSlot
//it checks if there is a player selected, and if so it removes that player from the array containing a copy of all
//the players. Then returns the array.
function allPlayersMinusParentsTaken(teamSlot){
    var allPlayers = players.slice();
    while(teamSlot.id>0){
        if(teamSlot.selectedPlayer!==null){
            allPlayers.splice(allPlayers.indexOf(players[playerNames.indexOf(teamSlot.selectedPlayer)]),1);
        }
        teamSlot=teamSlotArray[teamSlot.parent];
    }
    return allPlayers;
}

//Finds the places of all null elements. Then finds where those elements are in children arrays and removes them.
//Then it calculates what the new index of every element will be when it shifted from removing the null elements. Every
//parent and child array is searched, and the IDs there are replaced by the new IDs. The null spots are then removed.
function reIndexTeamSlotArray(){
    var removed = [];
    var newIndices = new Array(teamSlotArray.length);
    //find id of all removed things
    var nullsPassed = 0;
    for(var i = 0; i<teamSlotArray.length; i++){
        newIndices[i]=i+nullsPassed;
        if(teamSlotArray[i]===null){
            removed.push(i);
            nullsPassed++;
            newIndices[i]=null;
        }
    }
    //remove the removed teamSlots from any children arrays
    for(i = 0; i<teamSlotArray.length; i++){
        if(teamSlotArray[i]!==null){
            teamSlotArray[i].parent=newIndices[teamSlotArray[i].parent];
            for(var j = 0; j<teamSlotArray[i].children.length; j++){
                if(removed.indexOf(teamSlotArray[i].children[j])>-1){
                    teamSlotArray[i].children.splice(j,1);
                    j--;
                }
                else{
                    teamSlotArray[i].children[j]=newIndices[teamSlotArray[i].children[j]];
                }
            }
        }
    }
    for(i=0;i<teamSlotArray.length;i++){
        if(teamSlotArray[i]===null){
            teamSlotArray.splice(i,1);
            i--;
        }
    }
}

//function checkArrayContentsEqual(a,b){
//    if(a.length!=b.length)
//        return false;
//    for(var i=0; i<a.length; i++){
//        if(b.indexOf(a[i])<0)
//            return false;
//    }
//    return true;
//}
//function consolidateCheck(ts1,ts2){
//    if(!checkArrayContentsEqual(ts1.availablePlayers,ts2.availablePlayers)||ts1.selectedPlayer!==ts2.selectedPlayer||
//                    ts1.children.length!=ts2.children.length||ts1.pickNumber!=ts2.pickNumber)
//        return false;
//    for(var i=0; i<ts1.children.length; i++){
//        if(consolidateCheck(teamSlotArray[ts1.children[i]],teamSlotArray[ts2.children[i]])===false)
//            return false;
//    }
//    return true;
//}
//function sortTeamSlotsByPickNumber(){
//    var teamSlotsByLevel = new Array(teamNames.length+1);
//    for(var i = 0; i < teamSlotsByLevel.length; i++)
//        teamSlotsByLevel[i] = [];
//    for(var j = 0; j < teamSlotArray.length; j++)
//        teamSlotsByLevel[teamSlotArray[j].pickNumber].push(teamSlotArray[j]);
//    return teamSlotsByLevel;
//}
//function findOverlap(tsByPickNum){
//    var overlap = null;
//    for(var i = 0; i<tsByPickNum.length; i++){
//        if(tsByPickNum[i].length>1){
//            for(var j=0; j<tsByPickNum[i].length-1; j++){
//                overlap = [tsByPickNum[i][j]];
//                for(var k=j+1;k<tsByPickNum[i].length;k++){
//                    if(consolidateCheck(tsByPickNum[i][j],tsByPickNum[i][k]))
//                        overlap.push(tsByPickNum[i][k]);
//                }
//                if(overlap.length>1)
//                    return overlap;
//            }
//        }
//    }
//    return null;
//}
//function adjustTreeForOverlap(overlap){
//    for(var n=1;n<overlap.length;n++){
//        console.log("changing children of "+overlap[n].parent+" to "+teamSlotArray[overlap[0].parent].children.slice());
//        if(overlap[n].parent!=overlap[0].parent)
//            teamSlotArray[overlap[n].parent].children=teamSlotArray[overlap[0].parent].children.slice();
//        else
//            teamSlotArray[overlap[0].parent].children.splice(teamSlotArray[overlap[0].parent].children.
//                        indexOf(overlap[n].id),1);
//    }
//}
//function removeFromTeamSlotArray(toRemove){
//    for(var i=0; i<toRemove.length; i++)
//        teamSlotArray.splice(toRemove[i].id-i);
//    for(var j=0; j<teamSlotArray.length; j++)
//        teamSlotArray[j].id=j;
//}
//function tryToConsolidate(){
//    //Sort teamSlots by level
//    var tsByPickNum = sortTeamSlotsByPickNumber();
//    console.log("tsByPickNum "+tsByPickNum);
//    //Find the first level with overlap
//    var overlap = findOverlap(tsByPickNum);
//    console.log("overlap "+overlap);
//
//    if(overlap!==null){
//        //Change appropriate parents/children
//        adjustTreeForOverlap(overlap);
//
//        //Remove teamSlots not pointed to from teamSlotArray, and adjust IDs of other teamSlots
//        removeFromTeamSlotArray(overlap.splice(0,1));
//    }
//    redraw(false);
//}

/********************************************************************************************************/

















/********************************************CALLED FROM CLICK FUNCTIONS*******************************************
***These functions are called by actions taken by clicking a button, selecting***
***from a dropdown, etc. to change the teamSlotArray in some way***

undo(): Called from clicking undo button. Moves back to previous teamSlotArray stored in the states array. Stores the
    current state in the undoneStates array to enable the redo button.
redo(): Called from clicking redo button. Moves back to most recent teamSlotArray stored in the undoneStates array.
playerSelected(): Called when a player is selected from a dropdown menu. Makes that team slot now have the selected
    player, and removes that player from the availablePlayer arrays from the appropriate teamSlots across the tree.
branch(id): Called when the branch button is picked. Creates a teamSlot at the same level as the one whose id is
    passed into this function, and successive child teamSlots that go until they reach the last pick.
changePick(id,player): Called when the changePick button is hit to deselect a player from the teamSlot array where
    the changePick button was hit (which has the id of the first argument. Also adds that player back to the
    availablePlayer arrays of the appropriate teamSlots.
changeNumPicks(value): Called from dropdown where user selects number of picks to simulate. Either removes teamSlots
    above a certain pick number, of adds teamSlots to the end of the the current final picks.
******************************************************************************************************************/


//when undo is called it moves the state to the most recent state in states. It then puts a copy of that state into
//undoneStates so that it can redo to it. The redo array (undone states) is cleared when an action occurs other than
//undo or redo
function undo(){
    //put the current state in the redo array (undoneStates)
    var state = teamSlotArray.slice();
    for(var j=0; j<state.length;j++)
        state[j]=state[j].returnCopy();
    undoneStates.push(state);

    //pop most recent saved state and switch to that
    var newState = states.pop().slice();
    for(var i=0; i<newState.length; i++){
        teamSlotArray[i]=newState[i].returnCopy();
    }
    teamSlotArray.splice(newState.length,teamSlotArray.length-newState.length);

    redraw(true);
}

//This function first saves a copy of the current state and puts it in the states array, so you can undo the redo.
//Then it removes the teamSlotArray copy last added to the undoneStates array and makes the the new teamSlotArray.
function redo(){
    var state = teamSlotArray.slice();
    for(var j=0; j<state.length;j++)
        state[j]=state[j].returnCopy();
    states.push(state);

    //switch to the popped state from undone states
    var newState = undoneStates.pop().slice();
    for(var i=0; i<newState.length; i++){
        teamSlotArray[i]=newState[i].returnCopy();
    }
    teamSlotArray.splice(newState.length,teamSlotArray.length-newState.length);

    redraw(true);
}


//When a player is selected from a dropdown the selectedPlayer attribute of the teamSlot which the dropdown belonged
//to is set to the selected player, and then the selected player is removed from the availablePlayer arrays of its
//parents and children. Also, this is where the check is done to see if branches can be consolidated.
function playerSelected(id,player){
    saveState();
    teamSlotArray[id].selectedPlayer=player;
    teamSlotArray[id].removeFromAvailablePlayers(player,teamSlotArray);

    //tryToConsolidate();
    redraw(false);
}

//called when a branch function is hit
function branch(id){
    saveState();
    //get the parent of the teamSlot where branch was hit
    var parent = teamSlotArray[teamSlotArray[id].parent];
    //TeamSlot where branch was hit
    var branchLocation = teamSlotArray[id];
    var oldTempTS = parent;
    //figure out what available players array should be
    var newAvailArray = allPlayersMinusParentsTaken(parent);
    //The new teamSlot's available players should be the branch locations available players, plus all those selected by
    //children of branch location
    for(var i = parent.pickNumber; i<numPicks;i++){
        //Create new teamSlot which will be child of parent
        var tempTS = new TeamSlot(branchLocation.pickNumber,branchLocation.TeamName,oldTempTS.id,
            newAvailArray.slice(),teamSlotArray.length);
        oldTempTS.children.push(tempTS.id);
        //add to teamSlotArray
        teamSlotArray.push(tempTS);
        //remember the thing you just created b/c you have to make the next thing you create a child of it
        oldTempTS=tempTS;
        //We get some of the details for creating new TeamSlots from branchLocation, but they need to change as we go
        branchLocation=teamSlotArray[branchLocation.children[0]];
    }
    redraw(false);
}

//
function changePick(id,player){
    saveState();
    teamSlotArray[id].selectedPlayer=null;
    teamSlotArray[id].addToAvailablePlayers(players[playerNames.indexOf(player)],teamSlotArray);
    redraw(false);
}

//
function copyPickAcrossUnfilled(pickNumber,player){
    saveState();
    for(var i=0;i<teamSlotArray.length;i++){
        if(teamSlotArray[i].pickNumber==pickNumber&&teamSlotArray[i].selectedPlayer===null){
            teamSlotArray[i].selectedPlayer=player;
            teamSlotArray[i].removeFromAvailablePlayers(player,teamSlotArray);
        }
    }
    redraw(false);
}

//
function copyPickAcrossAll(pickNumber,player){
    saveState();
    for(var i=0;i<teamSlotArray.length;i++){
        if(teamSlotArray[i].pickNumber==pickNumber){
            teamSlotArray[i].selectedPlayer=player;
            teamSlotArray[i].removeFromAvailablePlayers(player,teamSlotArray);
        }
    }
    redraw(false);
}

//Performs one of two outcomes depending on whether we should add picks or take them away. Adding just adds to the
//current last picks until it reaches the new number of picks. Taking away removes all the teamSlots above the new
//threshold by making them null, and then calls reIndexTeamSlotArray() to get rid of gaps in the teamSlot array while
//making sure the ids are still correct.
function changeNumPicks(value){
    value = parseInt(value);//Value is a string, must convert to int
    saveState();
    //If adding picks
    if(value>numPicks){
        var setLength = teamSlotArray.length;
        for(var k=0; k<setLength; k++){
            if(teamSlotArray[k].pickNumber==numPicks){
                var iterator = teamSlotArray[k];
                for(var j=numPicks+1;j<=value;j++){
                    var tempTS = new TeamSlot(j,teamNames[j-1],iterator.id,iterator.availablePlayers.slice(),teamSlotArray.length);
                    teamSlotArray.push(tempTS);
                    iterator.children.push(tempTS.id);
                    iterator=tempTS;
                }
            }
        }
    }
    //If taking picks away
    else{
        for(var i=0; i<teamSlotArray.length; i++){
            if(teamSlotArray[i].pickNumber>value){
                teamSlotArray[i]=null;
            }
        }
        reIndexTeamSlotArray();
    }
    numPicks=value;
    redraw(false);
}

/***************************************************************************************************************/























/*********************************************CALLING SETUP FUNCTIONS**********************************************
***These are the function calls that start the whole program going***

******************************************************************************************************************/


createPlayers();
createTeamSlots();
redraw(false);


/*****************************************************************************************************************/