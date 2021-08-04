const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId`,
    {
        $menuItemId: menuItemId
    },
    (err, menuItem) => {
        if(err) {
            next(err);
        } else if (menuItem) {
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

menuItemsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`,
    {
        $menuId: req.params.menuId
    },
    (err, menuItem) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({menuItems: menuItem});
        }
    });
});

menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.params.menuId;
    db.get(`SELECT * FROM Menu WHERE Menu.id = $menuId`,
    {$menuId: menuId},
    (err, menu) => {
        if(err) {
            next(err);
        } else {
            if (!name || !inventory || !price || !menu) {
                return res.sendStatus(400);
        }
        db.run(`INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)`,
        {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: menuId
        },
        function(err) {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
                (err, newMenuItem) => {
                    res.status(201).json({menuItem: newMenuItem});
                });
            }
        });
    }
    });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.params.menuId;
    db.get(`SELECT * FROM Menu WHERE Menu.id = $menuId`,
    {$menuId: menuId},
    (err, menu) => {
        if(err) {
            next(err);
        } else {
            if (!name || !inventory || !price || !menu) {
                return res.sendStatus(400);
            } else {
                db.run(`UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price,
                menu_id = $menuId WHERE MenuItem.id = $menuItemId`,
                {
                    $name: name,
                    $description: description,
                    $inventory: inventory,
                    $price: price,
                    $menuId: menuId,
                    $menuItemId: req.params.menuItemId
                },
                function(err) {
                    if(err) {
                        next(err);
                    } else {
                        db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
                        (err, updatedMenuItem) => {
                            res.status(200).json({menuItem: updatedMenuItem});
                        });
                    }
                });
            }
        }
    });
});


module.exports = menuItemsRouter;