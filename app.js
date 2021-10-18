/**
 * BUDGET CONTROLLER MODULE
 * IIFE
 */
var budgetController = (function() {
    //expense object
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    //Add a method to the prototype of expense to calculate the percent
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;

        }

    };
    Expense.prototype.getPercentage = function() {
        return this.percentage;

    };

    //income object
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function(type) {
        var sum = 0;
        //loop through the array and save all the values in sum
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.total[type] = sum;
    };
    //data object for storing our data
    var data = {
            /**All the items... expense and income for now */
            allItems: {
                exp: [],
                inc: []
            },
            /**The total of the items respectively */
            total: {
                exp: 0,
                inc: 0
            },
            budget: 0,
            percentage: -1


        }
        ////////////////////////////
        ///Return an object that external APIs can connect with

    return {
        //This function adds a new object(expense or income) to the data object.
        //The object added will have a unique ID and the new object is returned
        addItem: function(type, des, val) {
            var newItem, ID;
            //check if the allItems list of the 'type' is empty
            if (data.allItems[type].length > 0) {
                //create new id . retrieve the last element's id and add 1 to it
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;


            } else {
                //if empty, set the Id to '0'

                ID = 0;
            }



            //create new item based on inc or exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);

            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);

            }
            //push it into the data structure
            data.allItems[type].push(newItem);

            //return the element
            return newItem;


        },
        //delete item
        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                //use splice() on the array. Give it the iindex to start deleting from and the number of data to delete
                data.allItems[type].splice(index, 1);

            }


        },
        //Calculate budget
        calculateBudget: function() {
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate total budgt.....: income - expenses
            data.budget = data.total.inc - data.total.exp;

            //calculate the percentage of the income that we spent
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },
        //Calculate percentages
        calculatePercentages: function() {
            /**E.g for expense
             * a=20,
             * b=10,
             * c=40
             * income = 100
             * a=20/100 = 20%
             * b= 10/100 = 10%
             * c= 40/100 = 40%
             * 
             */
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.total.inc);
            });

        },
        //get percentage
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function() {
            //return an object
            return {
                budget: data.budget,
                totalInc: data.total.inc,
                totalExp: data.total.exp,
                percentage: data.percentage

            };
        },

        //for testing purpose
        testing: function() {
            console.log(data);
        }

    };

})();



/*****************************
 * UI CONTROLLER MODULE
 * define another IIFE
 */
var UIController = (function() {


    ///hide the names of the tags classes
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expense--value',
        percentageLabel: '.budget__expense--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
        inputBtn: '.add__btn'
    };
    //format all the numbers
    formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        /*
         + 0r - before the number 
         Exactly 2 decimal point
         comma separating the thousands
         e.g
         2310.45667 -> + 2,310.6
         2000 -> + 2000.00
         */
        //get the absolute number
        num = Math.abs(num);
        num = num.toFixed(2);
        //split the string into integer part and ecimal part
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];


        //use ternary operator
        // type = 'exp' ? sign = '-' : sign = '+';
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;


    };
    var nodeListForEach = function(list, callbackFn) {
        for (var i = 0; i < list.length; i++) {
            callbackFn(list[i], i);

        }
    };
    ////Return an object external APIs can interface with
    return {
        getinput: () => {
            return {

                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp from the 'select' tag
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value) //convert string to number

            }



        },

        //add list items
        addListItems: function(obj, type) {
            var html, newHtml, element;

            //Create HTML string with placeholder text
            ///NOTE:::: placeholder for id is %id%, description is %description and %value% for value.
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div>' +
                    '<div class="right clearfix"> <div class="item__value">%value%</div>' +
                    '<div class="item__delete"> <button class="item__delete--btn"> <i class = "ion-ios-close-outline">' +
                    '</i></button></div> </div> </div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-$id%"> <div class="item__description">%description%</div>' +
                    '<div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">' +
                    '21 % </div> <div class="item__delete"> <button class="item__delete--btn">' +
                    '<i class="ion-ios-close-outline"> </i></button ></div></div> </div>';
            }





            //Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));


            //insert the HTML into the DOM(Doc Obj Model)
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        //delete list item
        deleteListItem: function(selectorID) {
            var el;
            el = document.getElementById(selectorID);
            //to delete a tag, move up and remove the child
            el.parentNode.removeChild(el);
        },
        //Clear all the input fields
        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); //retruns a list
            //convert the list to and array with slice(). slice() is in the Array prototype
            fieldsArr = Array.prototype.slice.call(fields);


            fieldsArr.forEach(function(current, index, array) {
                current.value = "";

            });
            //Set the focus back to the first element of the array(the description field)
            fieldsArr[0].focus();

        },
        //Display Budget
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '--';
            }
        },

        //Display percentages
        displayPercentages: function(percentages) {


            var fields = document.querySelectorAll(DOMstrings.expensePercLabel) // this returns a list(Node list)

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }


            });
        },
        displayMonth: function() {
            var now, year, months, month;
            //if u dont pass anything inot the Date constructor it returns today
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', "July",
                'August', 'September', 'October', 'November', 'December'
            ];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', ' + year

        },
        changedType: function() {
            //get the css classes to manipulate
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue); //returns a node list
            nodeListForEach(fields, function(cur) {
                //toggle adds the class when it is not there and remove it if it is already there
                cur.classList.toggle('red-focus');

            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },
        //pass the object of the classes names to other controllers that might need it
        getDomStrings: () => DOMstrings

    };
})();


/**************************************
 * GLOBAL App CONTROLLER MODULE
 * This will know about the two other modules and can connect them
 */
var controller = (function(budgetCtrl, UICtrl) {
    //Function that sets up the different listeners when the app initialises
    var setupEventListeners = function() {
        //get the strings of the tags classes
        var DOM = UICtrl.getDomStrings()
            //set up event listeners here for add button it is a click with ref to ctrlAddItm
        document.querySelector(DOM.addButton).addEventListener('click', ctrlAddItem)
            //Also listen for when a user hits the ENTER key
        document.addEventListener('keypress', (event) => {
            //every key of the keyboard has a unique key code associated with them
            //we are listening for only when the ENTER key is pressed
            if (event.keyCode === 13 || event.code === 'Enter') {
                ctrlAddItem()
            }

        })
        document.querySelector(DOM.container).addEventListener('click', ctrDeletItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    //update budget
    var updateBudget = function() {
        //1. calculate the budget
        budgetCtrl.calculateBudget();

        //2.return the budget
        var budget = budgetCtrl.getBudget();

        // 3. display the budget on the UI

        UICtrl.displayBudget(budget);


    };
    //update percentages
    var updatePercentages = function() {
        //1. calculate the percentages
        budgetCtrl.calculatePercentages();


        // 2. read them from the budget controller
        var percentages = budgetCtrl.getPercentages();


        //3 update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };


    //Function that is used 

    var ctrlAddItem = function() {
        var input, newItem;
        // 1. Get the filed input data
        input = UICtrl.getinput()

        //Validate the form
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)


            //3. add the item to the UI
            UICtrl.addListItems(newItem, input.type);

            //4. Clear the fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();

            //6. update percentages
            updatePercentages();

        }




    };
    var ctrDeletItem = function(event) {
        var itemID, splitID, type, ID;
        //get the Id of the node we are interested in
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from the user interface
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new total
            updateBudget();
            //4update percentages
            updatePercentages();

        }
    };

    return {
        init: () => {
            UICtrl.displayMonth();
            //CLEAR THE SCREEN. set everything to zero
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1

            });

            setupEventListeners();
            console.log("App has initialised")

        }
    }



})(budgetController, UIController);
//start up the code
//controller.init() er, UIController);
//start up the code
controller.init();