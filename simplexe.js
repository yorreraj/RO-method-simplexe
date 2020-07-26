var M = Math.pow(10, 10);
var EPSILON = Math.pow(10, -12);

/**
 * 
 * @param { Matrice } matriceInitiale - La matrice qui contient les deux matrice initiale (matrice de principale, et la matrice de base)
 * @param { Integer[] } i - Un vecteur qui contient l'indice des solutions initiale
 * @param { Float[] } A0 - Un vecteur qui contient les solutions initiale
 * @param { Float[] } Cj - Un vecteur qui contient les coefficients dans Z
 */
function Simplexe(tabInit){
    console.log(tabInit)
    var config = {
        matriceInitiale : tabInit.matriceInitiale,
        i: tabInit.i,
        A0: tabInit.A0,
        Cj: tabInit.Cj,
        Ci: [],
        deltaJ: [],
        z: 0,
        form_normal: true
    }

    //Initialisation de Ci
    config.i.forEach( i => {
        config.Ci.push(config.Cj[i-1]);
    })

    //Initialisation de DeltaJ = Cj - Somme(xij * Ci)
    for(var j=0; j< config.matriceInitiale.nbcolonnes; j++){
        var somme = 0;
        for(var i=0; i<config.matriceInitiale.nblignes; i++)
            somme += config.matriceInitiale.getValue(i, j) * config.Ci[i];
        config.deltaJ.push(config.Cj[j] - somme);
    }
    var somme = 0;
    for(var i=0; i<config.matriceInitiale.nblignes; i++)
        somme += config.A0[i] * config.Ci[i];
    config.z = somme;    


    var getPositionOfMaxPositiveInDeltaJ = function(){
        var  position = 0;
        for(var i=0; i<config.deltaJ.length; i++){
            if(config.deltaJ[i] > config.deltaJ[position])
                position = i;
        }
        return (config.deltaJ[position] > 0 ) ? position : -1;
    }

    var getPivot = function(positionOfMaxPositiveInDeltaJ){
        var colonnePivot = config.matriceInitiale.getColonne(positionOfMaxPositiveInDeltaJ);
        var last_i = 0;
        for(var i=0; i<colonnePivot.length; i++){
            var last_rapport = config.A0[last_i] / colonnePivot[last_i];
            var current_rapport =  config.A0[i] / colonnePivot[i];
            
            if(last_rapport < 0 || (current_rapport > 0 && current_rapport < last_rapport))
                last_i = i;
        }
        return {
            i: last_i,
            j: positionOfMaxPositiveInDeltaJ
        }
    }

    var updateTab = function(pivot){
        //Mis à jour de ligne de pivot
        var valeurPivot = config.matriceInitiale.getValue(pivot.i, pivot.j);
        for(var j=0; j<config.matriceInitiale.nbcolonnes; j++){
            config.matriceInitiale.setValue(pivot.i, j, config.matriceInitiale.getValue(pivot.i, j) / valeurPivot);
        }
        config.Ci[pivot.i] = config.Cj[pivot.j];
        config.i[pivot.i] = pivot.j + 1;
        config.A0[pivot.i] = config.A0[pivot.i] / valeurPivot;

        //Mis à jour des autres lignes
        for(var i=0; i<config.matriceInitiale.nblignes; i++){
            if(i != pivot.i){
                var coef = config.matriceInitiale.getValue(i, pivot.j);
                for(var j=0; j<config.matriceInitiale.nbcolonnes; j++){
                    config.matriceInitiale.setValue(i, j, config.matriceInitiale.getValue(i, j) - (config.matriceInitiale.getValue(pivot.i, j) * coef));  
                }
                config.A0[i] -= (config.A0[pivot.i] * coef);
                if(!config.form_normal && config.A0[i] == 0) config.A0[i] = EPSILON
            } 
        }

        //Mis à jour de deltaj
        var coef = config.deltaJ[pivot.j];
        for(var j=0; j<config.deltaJ.length; j++){
            config.deltaJ[j] -= (config.matriceInitiale.getValue(pivot.i, j) * coef)
        }
        config.z += (config.A0[pivot.i] * coef); 
    }

    var toFraction = function(number){
        var fraction = math.fraction(number);
        return fraction.d == 1 ? number : fraction.n + '/' + fraction.d
    }
    
    this.resoudre = function(form_normal, type_optimisation){
        config.form_normal = form_normal;

        var pos = getPositionOfMaxPositiveInDeltaJ();
        while(pos != -1){
            var pivot = getPivot(pos);
            updateTab(pivot);
            pos = getPositionOfMaxPositiveInDeltaJ();
        }

        var res = {
            xi: [],
            z : {
                realValue :  toFraction(config.z),
                aproachValue :  type_optimisation == 'max' ? config.z : -config.z
            }
        }
        for(var i=0; i<config.i.length; i++){
            res.xi['x'+config.i[i]] = {
                realValue : toFraction(config.A0[i]),
                aproachValue : config.A0[i]
            }
        }
        return res;
    }
}

