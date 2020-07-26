var plsimplexe = angular.module('PLSIMPLEXE', []);
var M = Math.pow(10, 10);

plsimplexe.controller('plSimplexeCtrl', function($scope){
    $scope.contraintes = [];
    $scope.nombreVariable = '';
    $scope.variables = [];

    $scope.fonctionZ = {
        optimisation : 'max',
        members : []
    }

    $scope.resultats = {
        xi : [],
        z : {
            realValue : '',
            aproachValue : 0 
        }
    }

    $scope.handleChange = {
        nombreVariable : function(){
            var variables = [];
            for(var i=1; i<=parseInt($scope.nombreVariable); i++)
                variables.push('x'+i);
            $scope.variables = variables;
            $scope.contraintes = [];
            $scope.fonctionZ.members = [];
        }
    }

    $scope.handleClick = {
        addMember : function(index){
            $scope.contraintes[index].firstMember.push({
                value: '1',
                variable: '1'
            })
        },
        removeMember : function(index){
            $scope.contraintes[index].firstMember.pop();
        },
        addContrainte : function(){
            if($scope.nombreVariable == ''){
                alert("Veuillez d'abord ajouter le nombre des variables");
            }else{
                $scope.contraintes.push({
                    firstMember : [],
                    signe : '-1',
                    secondMember: ''
                })
            }
        },
        removeContrainte : function(){
            $scope.contraintes.pop();
        },
        addMemberZ : function(){
            if($scope.nombreVariable == ''){
                alert("Veuillez d'abord ajouter le nombre des variables");
            }else{
                $scope.fonctionZ.members.push({
                    coef : '1',
                    variable : '1'
                })
            }
        },
        removeMemberZ : function(){
            $scope.fonctionZ.members.pop()
        },
        resoudre : function(){
            var simplexe = new Simplexe(getTableauInitiale());
            var res = simplexe.resoudre(isFormNormal(), $scope.fonctionZ.optimisation);
            
            for(var i=1; i<=parseInt($scope.nombreVariable); i++){
                if(res.xi['x'+i] != undefined){
                    $scope.resultats.xi.push({
                        name: 'x'+i,
                        realValue: res.xi['x'+i].realValue,
                        aproachValue: res.xi['x'+i].aproachValue,
                    })
                }else{
                    $scope.resultats.xi.push({
                        name: 'x'+i,
                        realValue: 0,
                        aproachValue: 0,
                    })
                }
            }
            $scope.resultats.z = res.z;
        }
    }

    function getTableauInitiale(){
        var contraintes = JSON.parse(JSON.stringify($scope.contraintes));
        var nombreVariable = parseInt($scope.nombreVariable);

        //Transformation des egalités en inégalités 
        for(var i=0; i< contraintes.length; i++){
            if(contraintes[i].signe == '0'){
                contraintes[i].signe = '-1'
                contraintes.splice(i+1, 0, {
                    firstMember : contraintes[i].firstMember,
                    signe : '1',
                    secondMember: contraintes[i].secondMember
                })
            }
        }

        //Recencement des variables d'écart et artificielles
        var nouveau_variable = [], nb_nouveau_variable = 0
        contraintes.forEach(function(contrainte){ 
            nouveau_variable.push(contrainte.signe == '-1' ? [1] : [-1, 1]);
            contrainte.signe == '-1' ? nb_nouveau_variable += 1 :  nb_nouveau_variable += 2;
        });

        //Récuperation des coefficients
        var tab_coefs = [], indice_i = [], a0 = [],
        next_indice_variable_ecart = nombreVariable,
        next_indice_variable_artificielle = nombreVariable + contraintes.length;
        for(var j=0; j<contraintes.length; j++){
            var contrainte = contraintes[j];
            a0.push(parseFloat(contrainte.secondMember))

            var coef = [];
            for(var i=0; i<(nombreVariable + nb_nouveau_variable);i++){
                coef.push(0);
            }

            for(var i=0; i<contrainte.firstMember.length; i++){
                coef[parseInt(contrainte.firstMember[i].variable) - 1] = parseInt(contrainte.firstMember[i].value)
            }
            
            if(nouveau_variable[j].length > 1){
                coef[next_indice_variable_artificielle] = nouveau_variable[j][1];
                indice_i.push(next_indice_variable_artificielle + 1);
                next_indice_variable_artificielle++;
            }else{
                indice_i.push(next_indice_variable_ecart + 1);
            }
            coef[next_indice_variable_ecart] = nouveau_variable[j][0];
            next_indice_variable_ecart++;

            tab_coefs.push(coef);
        }
        
        var cj = new Array(nombreVariable);
        for(var i=0; i<$scope.fonctionZ.members.length; i++){
            cj[parseInt($scope.fonctionZ.members[i].variable) - 1 ] = parseFloat($scope.fonctionZ.members[i].coef);
        }
        for(var i in nouveau_variable){
            cj.push(0);
        }
        nouveau_variable.forEach(function(variable){
            if(variable.length > 1)
                cj.push(($scope.fonctionZ.optimisation == 'min' ? M: -M));
        })

        if($scope.fonctionZ.optimisation == 'min'){
            for(var i=0; i<cj.length; i++){
                cj[i] = -cj[i]
            }
        }

        var tab_coefs_fusionne = new Array();
        tab_coefs.map(coefs => tab_coefs_fusionne = tab_coefs_fusionne.concat(coefs));
        var tabInit = {
            i: indice_i,
            matriceInitiale: new Matrice(tab_coefs.length, tab_coefs[0].length, tab_coefs_fusionne),
            A0: a0,
            Cj: cj
        }
        return tabInit;
    }

    function isFormNormal(){
        var normal = true;
        $scope.contraintes.forEach(function(contrainte){
            if(contrainte.signe == '0' || contrainte.signe == '1'){
                normal = false;
            } 
        })
        return normal;
    }
})