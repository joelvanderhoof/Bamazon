var inquirer = require('inquirer');
var mysql = require('mysql');
var columnify = require('columnify');

var prompt = inquirer.createPromptModule();

var connection = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'Bamazon'
});

connection.connect(function(err) {
    if (err) throw err;
    //console.log('connected as: ' + connection.threadId);
});

     
// List every available item: the item IDs, names, prices, and quantities.
var viewStock = () => {
    console.log('\n--------------------------------------------------------------------------------\n WELCOME TO BAMAZON: Manager Portal \n');
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;
        var columns = columnify(res, {
            columns: ["item_id", "product_name", "department_name" , "price", "stock_quantity"]
        });
        console.log(columns);
        managerOptions();
    });
}

// If a manager selects View Low Inventory, then it should list all items with a inventory count lower than five.
var lowInventory = () => {
    console.log('\n--------------------------------------------------------------------------------\n Items with less than 5 units in stock \n');
    connection.query('SELECT * FROM products WHERE stock_quantity < 5',
        function(err, res) {
            if (err) throw err;
            var columns = columnify(res, {
                columns: ["item_id", "product_name", "department_name" , "price", "stock_quantity"]
            });
        console.log(columns);
        managerOptions();
    });
}

// If a manager selects Add to Inventory, your app should display a prompt that will let the manager "add more" of any item currently in the store.
var addInventory = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "itemName",
            message: "Which item would you like to add more of?"
        },
        {
            type: "input",
            name: "addQty",
            message: "How much would you like to add to the stock?"
        }
    ]).then(function(choices) {
        connection.query('UPDATE BAMAZON.products SET ? WHERE ?', 
            [{ stock_quantity: parseInt(choices.addQty) },
                { item_id: choices.itemName }],
            function(err, res) {
                if (err) throw err;
                console.log("You have added " + choices.addQty + " " + choices.itemName + " to the invenory.");
                viewStock();
        });
    });
}

// If a manager selects Add New Product, it should allow the manager to add a completely new product to the store.
 var addProduct = () => {
    inquirer.prompt([

        {
            type: "input",
            name: "productName",
            message: "What is the name of the item to add?"
        },
        {
            type: "input",
            name: "departmentName",
            message: "What is the department name of the item to add?"
        },
        {
            type: "input",
            name: "price",
            message: "What is the price of the item to add?"
        },
        {
            type: "input",
            name: "stockQuantity",
            message: "What is the stock quantity of the item to add?"
        }
    ]).then(function(choices) {
        connection.query("INSERT INTO Bamazon.products SET ?",
        {
            product_name: choices.productName,
            department_name: choices.departmentName,
            price: choices.price,
            stock_quantity: choices.stockQuantity
        });
        managerOptions();
    });
}   

var managerOptions = () => {
    // List a set of menu options:
    // View Products for Sale
    // View Low Inventory
    // Add to Inventory
    // Add New Product
    inquirer.prompt([
        // The first should ask them the ID of the product they would like to buy.
        {
            type: 'list',
            name: 'options',
            message: 'Manager Options:',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
        }
    ]).then(function(choices) {
        switch(choices.options) {
            case 'View Products for Sale':
                viewStock();
                break;
            case 'View Low Inventory':
                lowInventory();
                break;
            case 'Add to Inventory':
                addInventory();
                break;
            case 'Add New Product':
                addProduct();
                break;
        }
    });
}

//show the options 
managerOptions();