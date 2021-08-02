const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemRouter = require('./menuItem');

menusRouter.param('menuId', (req, res, next, menuId) => {
    db.get('SELECT * FROM Menu WHERE Menu.id = $menuId', 
    {
        $menuId: menuId
    }, (err, menu) => {
        if(err){
            next(err);
        } else if(menu) {
            req.menu = menu;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

menusRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Menu`,
    (err, menus) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({menus: menus});
        }
    });
});

menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if(!title) {
        return res.sendStatus(400);
    } else {
        db.run(`INSERT INTO Menu (title) VALUES ($title)`,
        {
            $title: title
        },
        function(err){
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
                (err, newMenu) => {
                    res.status(201).json({menu: newMenu});
                });
            }
        });
    }
});

menusRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if(!title) {
        return res.sendStatus(400);
    } else {
        db.run(`UPDATE Menu SET title = $title`,
        {
            $title: title
        },
        (err) => {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
                (err, updatedMenu) => {
                    res.status(200).json({menu: updatedMenu});
                });
            }
        });
    }
});

menusRouter.delete('/:menuId', (req, res, next) => {
    db.get(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`,
    {
        $menuId: req.params.menuId
    },
    (err, menuItem) => {
        if(err) {
            next(err);
        } else if(menuItem) {
            res.sendStatus(400);
        } else {
            db.run(`DELETE FROM Menu WHERE Menu.id = $menuId`,
            {
                $menuId: req.params.menuId
            },
            (err) => {
                if(err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });
});

module.exports = menusRouter;