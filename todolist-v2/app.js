//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const date = require(__dirname + "/date.js");
const _ = require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const workItems = [];

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true})

const itemSchema = mongoose.Schema({
  name:String
})

const Item=mongoose.model("Item", itemSchema)

const Books=new Item({
  name:"books"
})

const Pencil=new Item({
  name:"pencil"
})

const Rubber=new Item({
  name:"rubber"
})

const defaultItems=[Books, Pencil, Rubber]


const listSchema=mongoose.Schema({
  name:String,
  items:[itemSchema]
})


const List=mongoose.model("List",listSchema)

app.get("/", function(req, res) {

  Item.find({},function(err, foundItems){
    if(foundItems==0){

Item.insertMany(defaultItems,function(err){
  if(err){
    console.log(err)
  }else{
    console.log("Success")
  }

  res.redirect("/")
})


    }else{
      res.render("list", {listTitle: 'Today', newListItems: foundItems});
      console.log("didn't add anything")


    
  }

  

})
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;


  const item = new Item({
    name:itemName
  })
    if(listName==="Today"){
        item.save();
        res.redirect("/")
    }else{
      List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item)
        foundList.save();
        res.redirect("/"+listName)
      })
    }




});


app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox
  const listName=req.body.listName

  if(listName==="Today"){

      Item.findByIdAndRemove(checkedItemId,function(err){
    if(!err){
      console.log("deleted checked item")
      res.redirect("/")
    }
  })
  }else{
    List.findOneAndUpdate(
      {name: listName},
      {$pull:{items:{_id:checkedItemId}}},
      function(err,foundList){
        if(!err){
          res.redirect("/"+listName)
        }
      }
    )}
  }


  
)

app.get("/:customListName",function(req,res){

  const customListname=_.capitalize(req.params.customListName)
  List.findOne({name:customListname},function(err,foundList){
    if(!err){
      if(!foundList){
        console.log("doesn't exist")
          const list = new List({
    name:customListname,
    items:defaultItems
  })
    list.save();
    res.redirect("/"+customListname)
      }else{
        res.render("list",{listTitle: customListname, newListItems: foundList.items})
      }
    }




  })



 
})
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
