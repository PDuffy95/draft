/****************************************************teamSlot****************************************************
This file contains the teamSlot class. A teamSlot represents one pick possibility, which is one node in the tree.

HELPER FUNCTIONS


CLASS FUNCTIONS
drawSelf(): This is a recursive function that is initially called on the head node in the 'CALLING SETUP FUNCTIONS'
    of the main code. I won't go into detail this this will change when I make it look good.
removeFromAvailablePlayers(player,teamSlotArray): This function removes the player from the availablePlayers of
    the teamSlot the function was called on and its parent and children. Uses the recursive 'tellChildren'
    and 'tellParents' helper functions.
addToAvailablePlayers(player,teamSlotArray): Same as removeFromAvailablePlayers except it adds the players to the
    arrays. Uses the recursive 'addChildren' and 'addParents' helper functions.
returnCopy(): Creates a new teamSlot with the same attributes as the current one and returns it.

*****************************************************************************************************************/


function TeamSlot(number,team,parent,availablePlayers,id){
    this.pickNumber = number;
    this.TeamName = team;
    this.parent = parent;
    this.children = [];
    this.availablePlayers = availablePlayers.slice();
    this.selectedPlayer = null;
    this.id = id;
}

TeamSlot.prototype.drawSelf = function(alreadyDrawn){
    //if statement cause don't want to draw if head node
    if(this.pickNumber>0){

        //if this is already drawn don't draw it, and if not mark it as drawn.
        if(alreadyDrawn[this.id]==1)
            return;
        else
            alreadyDrawn[this.id]=1;
        //create div and select
        var div = $('<div class=individualpick><b>'+this.TeamName+' '+this.id+'</b></div>');
        var selectOrPlayer = null;
        if(this.selectedPlayer===null){
            selectOrPlayer = $('<select onChange=playerSelected('+this.id+',this.value) id=pick'+this.pickNumber+'>'+this.TeamName+'</select>');

            //add options to select
            selectOrPlayer.append($('<option value="" disabled selected>Choose Player</option>'));
            for(var i=0;i<this.availablePlayers.length;i++){
                selectOrPlayer.append($("<option class=playerOption value='"+this.availablePlayers[i].name+"'>"+this.availablePlayers[i].name+'</option>'));
            }
        }
        else{
            selectOrPlayer = $('<div>'+this.selectedPlayer+'</div>');
            div.append($('<button onClick=changePick('+this.id+',"'+this.selectedPlayer+'") >Change Pick</button>'));
            div.append($('<button onClick=copyPickAcrossUnfilled('+this.pickNumber+',"'+this.selectedPlayer+'") >Copy Pick Across Unfilled</button>'));
            div.append($('<button onClick=copyPickAcrossAll('+this.pickNumber+',"'+this.selectedPlayer+'") >Copy Pick Across All</button>'));
        }
        div.append($('<button onClick=branch('+this.id+') >Branch</button>'));
        //add to end of hardcoded teamDraftBoxes div
        div.append(selectOrPlayer);
        var divID="pick"+this.pickNumber+"div";
        var foundDiv = document.getElementById(divID);
        if(foundDiv===null){
            $('#teamDraftBoxes').append($('<div id='+divID+' class=pickrow></div>').append(div));
        }
        else{
            $('#pick'+this.pickNumber+'div').append(div);
        }
    }
    //if head node, do all the set up.
    //How it's drawn: have a div for each pick number
    else{

    }
    //recursively call on children
    for(var j=0; j<this.children.length; j++){
        //if(this.children[j]>this.id)///////////////////////////////////////////////just a hack for merging
            teamSlotArray[this.children[j]].drawSelf(alreadyDrawn);
    }
};

//pass in a player name, finds index of that player in availablePlayers array. return -1 if not fonud.
function findPlayerIndex(teamSlot,playerName){
    for(var i = 0; i<teamSlot.availablePlayers.length; i++){
        if(playerName==teamSlot.availablePlayers[i].name)
            return i;
    }
    return -1;
}
//called by removeFromAvailablePlayers
function tellParents(teamSlot,player,teamSlotArray){
    var playerIndex = findPlayerIndex(teamSlot,player);
    if(playerIndex>-1){
        teamSlot.availablePlayers.splice(playerIndex,1);
    }
    if(teamSlot.id>0){
        tellParents(teamSlotArray[teamSlot.parent],player,teamSlotArray);
    }
}
//called by removeFromAvailablePlayers
function tellChildren(teamSlot,player,teamSlotArray){
    var playerIndex = findPlayerIndex(teamSlot,player);
    if(playerIndex>-1){
        teamSlot.availablePlayers.splice(playerIndex,1);
    }
    for(var i=0; i<teamSlot.children.length; i++)
        tellChildren(teamSlotArray[teamSlot.children[i]], player,teamSlotArray);
}
//function called when a player is selected and you want to remove that player from the available players
//you must also remove it from the parent, and parent's parent, etc. and child and childs' child.
TeamSlot.prototype.removeFromAvailablePlayers = function(player,teamSlotArray){
    tellParents(this,player,teamSlotArray);
    tellChildren(this,player,teamSlotArray);
};

//called by addToAvailablePlayers
function addParents(teamSlot,player,teamSlotArray){
    var playerIndex = findPlayerIndex(teamSlot,player.name);
    if(playerIndex==-1){
        teamSlot.availablePlayers.push(player);
    }
    if(teamSlot.id>0){
        addParents(teamSlotArray[teamSlot.parent],player,teamSlotArray);
    }
}
//called by addToAvailablePlayers
function addChildren(teamSlot,player,teamSlotArray){
    var playerIndex = findPlayerIndex(teamSlot,player.name);
    if(playerIndex==-1){
        teamSlot.availablePlayers.push(player);
    }
    for(var i=0; i<teamSlot.children.length; i++)
        addChildren(teamSlotArray[teamSlot.children[i]], player,teamSlotArray);
}
//function called when you change a pick and want to add the players back to the availablePlayers arrays
TeamSlot.prototype.addToAvailablePlayers = function(player,teamSlotArray){
    addParents(this,player,teamSlotArray);
    addChildren(this,player,teamSlotArray);
};


TeamSlot.prototype.returnCopy = function(){
    var copy = new TeamSlot(this.pickNumber,this.TeamName,this.parent,this.availablePlayers.slice(),this.id);
    copy.children = this.children.slice();
    copy.selectedPlayer = this.selectedPlayer;
    return copy;
};