// budget controller
var budgetController = (function(){
    
    var Expenses = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expenses.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };

    Expenses.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Incomes = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calcTotals = function(type){
        var sum=0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
            
    };

    return {
        addItem: function(type, des, val){
            var ID, newItem;

            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
    
            }else{
                ID = 0;
            }

            if(type === 'inc'){
                newItem = new Incomes(ID, des, val);
            }else if(type === 'exp'){
                newItem = new Expenses(ID, des, val);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem: function(type, id) {

            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
            
        },

        calcBudget: function(){
            calcTotals('inc');
            calcTotals('exp');

            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.exp > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            var perc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return perc;
        },

        testing: function(){
            return console.log(data);
        }  
    };
})();



// UI controller
var UIController = (function(){

    var DOMString = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        inputIncomeContainer: '.income__list',
        inputExpensesContainer: '.expenses__list',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        budgetLabel: '.budget__value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        inputPercentage: '.item__percentage',
        month: '.budget__title--month'
    };

    formatNumber = function(num, type){
        var num, numSplit, int , dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length -3, 3);
        }

        dec = numSplit[1];

        return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;       
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return{
                type: document.querySelector(DOMString.inputType).value,
                description: document.querySelector(DOMString.inputDescription).value,
                value: parseFloat(document.querySelector(DOMString.inputValue).value)
            }          
        },

        addListItem: function(type, obj){
            var html, newHtml, element;
            // create html string
            if(type === 'inc'){
                element = DOMString.inputIncomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><ion-icon name="close-circle-outline"></ion-icon></button></div></div></div>';
            }else if(type === 'exp'){
                element = DOMString.inputExpensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><ion-icon name="close-circle-outline"></ion-icon></button></div></div></div>';
            }
            
            // replace the placeholder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // insert html in DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {

            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearField: function(){
            var field, fieldArr;
            field = document.querySelectorAll(DOMString.inputDescription + ', ' + DOMString.inputValue);
            fieldArr = Array.prototype.slice.call(field);

            fieldArr.forEach(function(current, index, arr){
                current.value = '';
            });

            fieldArr[0].focus();
        },

        displayBudget: function(obj){
            var type;
            (obj.budget > 0) ? type = 'inc' : type = 'exp';

            document.querySelector(DOMString.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMString.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMString.budgetLabel).textContent = formatNumber(obj.budget, type);

            if(obj.percentage > 0){
                document.querySelector(DOMString.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMString.percentageLabel).textContent = '--';
            }
        },

        displayPercentages: function(obj){
            //document.querySelector(DOMString.inputPercentage).textContent = obj.percentage + '%';
            var fields = document.querySelectorAll(DOMString.inputPercentage);
            
            nodeListForEach(fields, function(current, index) {
                
                if (obj[index] > 0) {
                    current.textContent = obj[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function(){
            var now, month, months, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August','September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMString.month).textContent = months[month] + ' ' + year;
        },

        changedType: function(){
            var fields = document.querySelectorAll(`${DOMString.inputType}, ${DOMString.inputDescription}, ${DOMString.inputValue}`);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMString.inputBtn).classList.toggle('red');
        },

        getDOMStrings: function(){
            return DOMString;
        }
    };
})();



// App controller
var controller = ( function(UICtrl, budgetCtrl){

    var setUpEventListeners = function() {
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', addItem);

        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                addItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', cDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        
    };

    var updatePercentages = function(){
        //calculate percentages
        budgetCtrl.calculatePercentages();

        // read percentages in budget controller
        var percentage = budgetCtrl.getPercentages();

        //display the percentages
        UICtrl.displayPercentages(percentage);
        //console.log(percentagess);

    };

    var updateBudget = function(){
        var budget;
        //calculate the budget
        budgetCtrl.calcBudget();

        // get budget
        budget = budgetCtrl.getBudget();

        //display the budget
        UICtrl.displayBudget(budget);


    };

    var addItem = function() {
        //get the field input
        var input = UICtrl.getInput();
        
        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
            //add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //add the item to UI
            UICtrl.addListItem(input.type, newItem);

            // clear fields
            UICtrl.clearField();

            // display budget
            updateBudget();

            // percentages
            updatePercentages();     
        }  
    };

    var cDeleteItem = function(event) {
        var itemID, itemArr, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            itemArr = itemID.split('-');
            type = itemArr[0];
            ID = parseInt(itemArr[1]);


            // delete from data
            budgetCtrl.deleteItem(type, ID);

            // delete from UI
            UICtrl.deleteListItem(itemID);

            // update budget
            updateBudget();

            // percentages
            updatePercentages();
        }  
    };

    return {
        init: function(){
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
            UICtrl.displayMonth();
            setUpEventListeners();
        }
    };
    

})(UIController, budgetController);

controller.init();

