const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();
const port = process.env.PORT || 3000;

// const items = ["Buy food", "Make food", "Eat food"];
// const workItems = [];

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(
    "mongodb+srv://admin-christel:PhilMilLil33@cluster0.1xmekav.mongodb.net/todolistDB"
  );
}

//Created Schema
const itemsSchema = new mongoose.Schema({
  name: String,
});
//Created model
const Item = mongoose.model("Item", itemsSchema);

//Creating items
const item1 = new Item({
  name: "Welcome to your todo list.",
});

const item2 = new Item({
  name: "Hit + button to create a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const listsSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});
const List = mongoose.model("List", listsSchema);

//Storing items into an array
const defaultItems = [item1, item2, item3];

const day = date.getDate();

app.get("/", function (req, res) {
  // const day = date.getDate();
  // res.render("list", { listTitle: day, newListItems: items });
  Item.find({})
    .then(function (foundItems) {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("Successfully saved into our DB.");
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: day, newListItems: foundItems });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/", (req, res) => {
  console.log(req.body);
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch(function (err) {});
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", (req, res) => {
  const obj = JSON.parse(req.body.checkbox);
  console.log(obj.listName, obj.itemName, obj.itemId);

  if (obj.listName === day) {
    Item.findByIdAndRemove(obj.itemId)
      .then(() => {
        console.log("Successfully deleted checked item from the database");
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    List.findOneAndUpdate(
      { name: obj.listName },
      { $pull: { items: { _id: obj.itemId } } }
    ).then(function (foundList) {
      res.redirect("/" + obj.listName);
    });
  }
});

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        console.log("saved");
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(function (err) {});
});

// app.post("/work", function (req, res) {
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(port, function () {
  console.log("Server has started successfully");
});
