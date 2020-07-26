function Matrice(_nblignes, _nbcolonnes, _values = []){
    this.nblignes = _nblignes;
    this.nbcolonnes = _nbcolonnes;
    this.values = [];

    //Initialisation de la matrice
    if(_values.length == 0){
        for(var i=0; i<this.nblignes; i++){
            var ligne = [];
            for(var j=0; j<this.nbcolonnes; j++)
                ligne.push(0);
            this.values.push(ligne);    
        }
    }else{
        var ligne = [];
        for(var i=0; i<_values.length; i++){
            ligne.push(_values[i])
            if((i+1)%this.nbcolonnes == 0){
                this.values.push(ligne);
                ligne = [];
            }
        }
    }

    //getters and setters
    this.getValue = function(ligne, colonne){
        return this.values[ligne][colonne];
    }
    this.setValue = function(ligne, colonne, value){
        this.values[ligne][colonne] = value;
    }

    this.getLigne = function(ligne){
        return this.values[ligne];
    }
    this.setLigne = function(ligne, values){
        this.values[ligne] = values
    }

    this.getColonne = function(colonne){
        var res = [];
        for(var i=0; i<this.nblignes; i++){
            res.push(this.values[i][colonne]);
        }
        return res;
    }
    this.setColonne = function(colonne, values){
        for(var i=0; i<this.nblignes; i++){
            this.nblignes[i][colonne] = values[i];
        }
    }

    this.getValues = function(){
        var res = [];
        for(var i=0; i<this.nblignes; i++){
            res = res.concat(this.getLigne(i))
        }
        return res;
    }
}