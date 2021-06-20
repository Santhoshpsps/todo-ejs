const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const app = express();
const _ = require("lodash");
const mongoose = require('mongoose');
// let items=["Buy Eggs","Chcocaltes","Bread"];
// let workItems=[];
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistdb",{useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex: true,useFindAndModify: false})

const itemsSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("item",itemsSchema);

const item1 = new Item({
  name:"Buy Eggs."
});
const item2 = new Item({
  name:"Buy Chocs."
});
const item3 = new Item({
  name:"Buy Newspaper."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("list",listSchema);


app.get("/",function(req,res){
  let day = date.getDate();

  Item.find(function(err,items){
    // mongoose.connection.close()
    if(items.length == 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Insertion Succcess into db.");
        }
      });
      res.redirect("/");
    }
    else{
        console.log(items);
        res.render("list",{listTitle:"Today", newitems: items});
    }
  });
});

app.post("/",function(req,res){
  let itemName = req.body.newitem;
  let listName = req.body.list;


  const newitem = new Item({
      name:itemName
    });

if(listName === "Today"){
  newitem.save();
  res.redirect("/");
}else{
  List.findOne({name: listName},function(err,foundList){
    foundList.items.push(newitem);
    foundList.save();
    res.redirect("/"+ listName);
  });
}

  // if(req.body.list === "Work"){
  //   workItems.push(item);
  //   res.redirect("/work");
  // }
  // else{
  //   items.push(item);
  //   res.redirect("/");
  // }

});

app.post("/delete",function(req,res){
  const id = req.body.checkbox;
  const listName = req.body.listName;
  // console.log(id);

  if(listName === "Today"){
    Item.findByIdAndDelete(id,function(err){
      if(!err){
        console.log("Item Removed From  db.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:id}}},function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }


})

app.get("/:pagename",function(req,res){

  const pagename = _.capitalize(req.params.pagename);
  List.findOne({name:pagename},function(err,foundItem){
    if(!err){
      if(!foundItem){
        const newList = new List({
          name: pagename,
          items:defaultItems
        });
        newList.save();
        res.redirect("/"+pagename);
      }
      else{
        res.render("list",{listTitle:foundItem.name, newitems: foundItem.items})
      }
    }
    else{
      console.log(err);
    }
  });
});
// app.get("/work",function(req,res){
//   res.render("list",{listTitle:"Work List",newitems:workItems});
//
// });

app.get("/about",function(req,res){
  res.render("about");
});

app.listen(process.env.PORT||3000,function(){
  console.log("Server Starts....");
})
