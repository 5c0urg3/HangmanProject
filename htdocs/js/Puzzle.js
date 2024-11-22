class Puzzle{
    constructor(word, hint){
        this.word = word;
        this.hint = hint;
        this.solved = false;
    }

    getPositions(char){
        let arrayOfPositions = [];
        for(let i = 0; i < this.word.length; i++){
            if(this.word[i].toLowerCase() == char.toLowerCase()){
                arrayOfPositions.push(i);
            }
        }
        return arrayOfPositions;
    }

    solvePuzzle(){
        this.solved = true;
    }
}