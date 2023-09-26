const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require("lodash");

const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true });

const itemSchema = new mongoose.Schema({
    name: String
});

const ITEM = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const LIST = mongoose.model("List", listSchema);


const item1 = new ITEM({
    name: "Buy Food"
});

const item2 = new ITEM({
    name: "Buy Clothes"
});

const item3 = new ITEM({
    name: "Buy Groceries"
});

const defaultItems = [item1, item2, item3];

app.set("view engine", "ejs");

app.get('/', (req, res) => {
    
    /*let today = new Date();
    
    let option = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }

    let day = today.toLocaleDateString("en-US", option);     //converts the date into string

    */

    ITEM.find()
        .then((item) => {

            if (item.length === 0)  //if there is no item in the array then add these default items to the collection.
            {
                ITEM.insertMany(defaultItems)
                    .then(() => {
                        console.log("Successfully Inserted!!!");
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                
                res.redirect("/");
            }

            else {

                res.render("list", { listTitle: "Today", newItem: item});      
                
            }

           
        })
        .catch((err) => {
            console.error(err)
        })


    
});

app.post("/", (req, res) => {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new ITEM({
        name: itemName
    });

    if (listName === "Today")
    {
        item.save();  //save the new document into the collection

        res.redirect("/");  //redirect to the home to display the new items
    }
    else {
        LIST.findOne({ name: listName })
            .then((foundList) => {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            })
            .catch((err) => {
                console.log(err);
            })
    }

    
})

app.post("/delete", (req, res) => {

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today")
    {
       ITEM.deleteOne({ _id: checkedItemId })
        .then(() => {
            console.log("Successfully deleted");
        })
        .catch((err) => {
            console.log(err);
        })
    
        res.redirect("/"); 
    }
    else {
        LIST.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
            .then(() => {
                res.redirect("/" + listName)
            })
            .catch((err) => console.log(err))
    }

    
    
})

app.get("/:urlName", (req, res) => {
    const customListName = _.capitalize(req.params.urlName);

    LIST.findOne({ name: customListName })
        .then((foundList) => {

            if (foundList)
            {
                //show an existing list
                 res.render("list", { listTitle: foundList.name, newItem: foundList.items});

            }
            else {
                //create a new list

                const list = new LIST({
                    name: customListName,
                    items: defaultItems
                });     

                list.save();

                res.redirect("/" + customListName);

            }
            
        })
        .catch((err) => {
            console.log(err);
        })
        

   


});


app.get('/work', (req, res) => {
    res.render("list", { listTitle: "Work List", newItem: workItems });
});

app.post('/worker', (req, res) => {
    
    let item = req.body.newItem;

    workItems.push(item);

    res.redirect("/worker");
})

app.listen(5000, () => console.log("Server is listening to port 5000"));


/*  --------EJS-----------

EJS is used to render templates  (format: <%= key/variable %>)

res.render() it will render the template

res.render("list", { kindOfDay: day })  ---> res.render() will take 2 parameters :

i) ejs filename (to be render) which must be present inside the folder named "views"
ii) JS object which will take a key/value pair  ; key -> present in list.ejs file && value -> present in app.js file


*/


/*  ----------Scope--------------

Two types of scopes are there in JS

i) Global scope
ii) Local scope


var,let,const  ---> if these are initialized inside a function then they have local scope. If these are initialized outside a function and inside the code then they have Global scope.

Inside a If else statement or inside a loop let & const acts as local but var act as global.


Better practice is to use let and const.


*/

