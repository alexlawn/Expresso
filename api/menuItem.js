const express = require('express');
const menuItemRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemRouter.param('menuId', (req, res, next, menuId) => {
    db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = $menuId`,
    {
        $menuId: menuId
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

menuItemRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`,
    {
        $menuId: req.params.menuId
    },
    (err, menuItem) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({menuItem: menuItem});
        }
    });
});