const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();
const port = process.env.PORT || 5000;

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname +'/public'));


mongoose.connect("mongodb://localhost:27017/todoListdb")
.then(()=>console.log(`connection sucessful`))
.catch((err)=>console.log(err));

const itemSchema = new mongoose.Schema({
    name : String
});

const Item = new mongoose.model("Item",itemSchema);
        
        const item1 = new Item({
            name : "Buy Food"
        });
        const item2 = new Item({
            name : "Cook Food"
        });
        const item3 = new Item({
            name : "Eat Food"
        });
        
        const defaultItem = [item1,item2,item3];
        

const listSchema = new mongoose.Schema({
    name : String,
    item : [itemSchema]
});

const List = new mongoose.model("List",listSchema);



app.get("/",(req,res)=>{

    const findconnection = async function(){
        try {
            const findResult = await  Item.find();
            
            if (findResult.length === 0) {
                Item.insertMany(defaultItem)
                .then(()=>console.log(`successfuly inserted default item`))
                .catch((err)=>console.log("error"));    
                res.redirect("/");
            }else{
                res.render("list",{listItem:"Today",newItems:findResult});
            }

        } catch (error) {
            console.log("err");
        }
    }
    
    findconnection();
});

app.post("/",(req,res)=>{
    console.log("from post");
    let itemName = req.body.newItem;
    let listName = req.body.list;

    const createNewItem = new Item({
        name : itemName
    });

    if (listName === "Today") {
        createNewItem.save()
        .then(()=>res.redirect("/"))
        .catch((err)=>console.log(err))
    }else{
        List.findOne({name:listName})
        .then((foundList)=>{
            foundList.item.push(createNewItem);
            foundList.save();

            res.redirect("/" + listName);
        })
    }
    
});

app.get("/:costumListName",async(req,res)=>{
    const costumListName = _.capitalize(req.params.costumListName);

   const foundList = await List.findOne({name:costumListName})
    
        if (!foundList) {
            const list = new List({
                name:costumListName,
                item:defaultItem
            });
            list.save();
            res.redirect("/"+costumListName)
            
        } else {
          res.render("list",{listItem:foundList.name,newItems:foundList.item})
        }
    })



app.post("/delete",async(req,res)=>{
    const deleteItem = req.body.checkbox;
    const listName = req.body.list;

    if (listName === "Today") {
        
            Item.findByIdAndRemove(deleteItem)
            .then(()=>console.log(`sucessful delete`))
            .catch((err)=>console.log(err))
            res.redirect("/");
        
    } else {

            await List.findOneAndUpdate({name:listName},{$pull:{item:{_id:deleteItem}}});

            res.redirect("/"+listName);

    }
})

app.listen(port,()=>{
    console.log(`server is running on the port ${port}`);
})

