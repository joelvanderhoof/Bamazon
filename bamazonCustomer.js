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

//Display inventory and prices in the console
var showStock = () => {
    console.log('\n--------------------------------------------------------------------------------\n WELCOME TO BAMAZON! \n');
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;
        var columns = columnify(res, {
            columns: ["item_id", "product_name", "department_name" , "price", "stock_quantity"]
        });
        console.log(columns);
        whatToBuy()
    });
}

var whatToBuy = () => {

    // first display all of the items available for sale. Include the ids, names, and prices of products for sale.
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;

    });

    // The app should then prompt users with two messages.
    inquirer.prompt([

        // The first should ask them the ID of the product they would like to buy.
        {
            type: 'input',
            name: 'productSelection',
            message: 'What would you like to buy?'
        },

        // The second message should ask how many units of the product they would like to buy.
        {
            type: 'input',
            name: 'productQuantity',
            message: 'How much would you like?'
        }
    ]).then(function(choices) {
        connection.query("SELECT * FROM products WHERE ?",
            {
                product_name: choices.productSelection
            },
            function(err, res) {
                if (err) throw err;

                var orderItem = res[0].item_id;
                var itemPrice = res[0].price;
                var orderQty = parseFloat( choices.productQuantity);
                var stockQty = parseInt(res[0].stock_quantity);
                var orderTotal = itemPrice * orderQty;

                console.log("Stock: " + stockQty);
                console.log("productQuantity: " + orderQty);

                // Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.
                // If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.
                if (stockQty < orderQty) {
                    console.log('Insuficcient quantity!');
                    showStock();
                } else {
                stockQty -= orderQty;

                // If your store does have enough of the product, you should fulfill the customer's order.
                // This means updating the SQL database to reflect the remaining quantity.
                connection.query('UPDATE BAMAZON.products SET ? WHERE ?', 
                    [{ stock_quantity: stockQty },
                        { item_id: orderItem }],
                    function(err, res) {
                        if (err) throw err;
                        console.log('Your order total is $' + orderTotal);
                        showStock();
                 });

                //UPDATE `bamazon`.`products` SET `stock_quantity`='25' WHERE `item_id`='7';
                // Once the update goes through, show the customer the total cost of their purchase.


                }
        });
    });

}
//Show the store
showStock();


