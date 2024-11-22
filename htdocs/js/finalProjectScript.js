//Load all puzzles for session
//Choose random puzzle from unsolved puzzles.
//Foreach letter in puzzle display a image covering the letter, add these to two arrays, one for images, one for letters

let unsolvedPuzzles = [];
readPuzzleJson();

let chosenPuzzle;
let currentInvaders = [];
let maximumGuesses = 6;
let remainingGuesses = 6;


const maximumHeightInvaders = -40;
const minimumHeightInvaders = 47;

const minimumInvaderLeft = 0;
let maximumInvaderLeft;
let invaderMaximumSteps = 10;
let invaderMovementSteps = 0; 
let movementIncrement;
let invaderWidth;
let goingRight = true;

let animationHandler;
let stopAnimation = false;
let pauseAnimation = false;
let freezeInput = false;

const maxInvaders = 3;
const invader1Html = `<img src = "../images/invader.png" alt =  "An alien invader." width = 50px class = "invader">`;
const invader2Html = `<img src = "../images/invader2.png" alt =  "An alien invader." width = 50px class = "invader">`;
const invader3Html = `<img src = "../images/invader3.png" alt =  "An alien invader." width = 50px class = "invader">`;

$(window).resize(resetAnimation);
$("#playAgain").on("click", resetGame);

async function readPuzzleJson() {
    try {
        const response = await fetch("../resources/puzzles.json");
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
    
        const json = await response.json();
        console.log(json);

        json.forEach((item, index) => {
            if (!item || typeof item.word === 'undefined' || typeof item.hint === 'undefined') {
                console.warn(`Item at index ${index} is missing expected properties:`, item);
            }
        });

        json.forEach(item => {
            if (item.word && item.hint) {
                unsolvedPuzzles.push(new Puzzle(item.word, item.hint));
            }
        });
        assignButtons();
        selectPuzzle();
    } catch (error) {
        console.error(error.message);
    }
    
  }

function assignButtons(){
    $("#letterButtons button").each(function(index, element){
        $(element).on("click", function(){
            if(!freezeInput){
                $(element).prop("disabled", true);
                guessALetter(String.fromCharCode(97+index));
            }
        });
    });  
}

function resetButtons(){
    $("#letterButtons button").each(function(index, element){
        $(element).prop("disabled", false);
    }); 
}

function selectPuzzle(){
    clearPuzzle();
    chosenPuzzle = unsolvedPuzzles[Math.floor(Math.random() * unsolvedPuzzles.length)];
    $("#hint").text(chosenPuzzle.hint);
    assignInvaders();
    resetButtons();
}

function clearPuzzle(){
    $(".invader").remove();
    $(".bigLetter").remove();
    currentInvaders = [];
}

function assignInvaders(){
    for(let i = 0; i < chosenPuzzle.word.length; i++){
        const rand = Math.floor(Math.random() * maxInvaders);
        if(rand == 0){
            $(".viewport").append(invader1Html);
        }
        else if(rand == 1){
            $(".viewport").append(invader2Html);
        }
        else if(rand == 2){
            $(".viewport").append(invader3Html);
        }
    }
    $(".viewport .invader").each(function(index, element){
        $(element).css("top", `${maximumHeightInvaders}%`)
        currentInvaders.push(element);
    })
    setUpAnimator();
}

function setUpAnimator(){
    invaderWidth = parseInt($(".invader").css("width"));
    maximumInvaderLeft = parseInt($(".viewport").css("width")) - (invaderWidth * (currentInvaders.length + 6));
    
    invaderMaximumSteps = Math.round(maximumInvaderLeft/invaderWidth);
    movementIncrement = ((maximumInvaderLeft-minimumInvaderLeft)/(invaderMaximumSteps));
    if(maximumInvaderLeft > 0){
        animationHandler = requestAnimationFrame(animateInvaders);
    }
}

function resetAnimation(){
    if(!stopAnimation){
        for(index = 0; index < currentInvaders.length; index ++){
            $(currentInvaders[index]).css("left", 0);
        }
        cancelAnimationFrame(animationHandler);
        stopAnimation = true;
        setTimeout(()=>{
            stopAnimation = false;
            setUpAnimator();
        },1000);
    }
}

function animateInvaders(){
    if(stopAnimation){
        return;
    }
    if(currentInvaders.length > 0){
        setTimeout(()=>{
            if(!pauseAnimation){
                if(invaderMovementSteps >= invaderMaximumSteps && goingRight){
                    goingRight = false;
                }
                else if(invaderMovementSteps <= 0 && goingRight == false){
                    goingRight = true;
                }

                for(index = 0; index < currentInvaders.length; index ++){
                    let newLeft  = (invaderMovementSteps * movementIncrement);
                    $(currentInvaders[index]).css("left", newLeft + "px");
                    if($(currentInvaders[index]).hasClass("bigLetter")){
                        $(currentInvaders[index]).css("opacity", 100);
                    }
                }

                if(goingRight){
                    
                    invaderMovementSteps ++;
                    
                }
                else{
                    invaderMovementSteps --;
                }
            }
            animationHandler = requestAnimationFrame(animateInvaders);
        },"500");
    }
}

function guessALetter(letter){

    if(typeof letter == 'string' && remainingGuesses > 0){
        let positions = [];
        positions = chosenPuzzle.getPositions(letter);
        if( positions.length > 0){
            pauseAnimation = true;
            freezeInput = true;
            fireAtLetter(positions, letter);
        }
        else{
            remainingGuesses -= 1;
            //Play animation for miss, explosion
            setHeight();
            
            if(remainingGuesses <= 0){
                //Lose the game
                toggleEnd(false);
            }
        }
        
    }
}

function fireAtLetter(positions, letter){
    let newPositions = positions;
        
    let position = newPositions.shift();
    $("#cannon").animate({
        left: (parseInt($(currentInvaders[position]).position().left)) + "px",
    }, "fast",()=>{
        $(".whiteDot").addClass("visible");
        $(".whiteDot").css("left", (parseInt($("#cannon").position().left) + parseInt($("#cannon").attr("width"))/2) + "px",)
        $(".whiteDot").animate({
            top: (parseInt($(currentInvaders[position]).position().top)) + "px",
            
        }, "fast",()=>{ 
            $(".whiteDot").removeClass("visible");
            $(".whiteDot").css("top", (parseInt($("#cannon").position().top)) + "px",)
            let newItem = $(`<p class = "bigLetter">${letter}</p>`);
                    if(position == 0){
                        newItem = $(`<p class = "bigLetter">${letter.toUpperCase()}</p>`);
                    }
                    
                    $(currentInvaders[position]).replaceWith(newItem);
                    currentInvaders[position] = newItem;
                    $(newItem).css("opacity", 0);
                    setHeight();
            if(newPositions.length <= 0){
            let solved = true;
                currentInvaders.forEach(invader => {
                    if($(invader).attr("class") == "invader"){
                        solved = false;
                    }
                });
                if(solved && remainingGuesses > 0){
                    unsolvedPuzzles.splice(unsolvedPuzzles.indexOf(chosenPuzzle),1);
                    //Change to option to try again, enable try again button which triggers this
                    toggleEnd(true);
                }
                pauseAnimation = false;
                freezeInput = false;
                }
                else{
                    fireAtLetter(newPositions, letter);
                }});
}
);
    
}

function toggleEnd(won){
    if(won){
        $("#successMessage").text("You Won!");
        $("#popupIcon").attr("src", "../images/check.png");
    }
    else{
        $("#successMessage").text("You Lost... :(");
        $("#popupIcon").attr("src", "../images/redx.png");
    }
    $("#endPopup").animate({
        opacity : "100%"
    }), "fast";
    
}

function resetGame(){
    $("#endPopup").animate({
        opacity : "0%"
    }), "fast",
        selectPuzzle();
        resetAnimation();
        remainingGuesses = maximumGuesses;
    ;
    
    
}

function setHeight(){
    const invaderHeight = maximumHeightInvaders + (((minimumHeightInvaders - maximumHeightInvaders)/maximumGuesses) * (maximumGuesses - remainingGuesses));
            $(".invader").css("top",`${invaderHeight}%`);
            $(".bigLetter").css("top",`${invaderHeight}%`);
}