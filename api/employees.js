const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// This middleware function will be called whenever there is an employeeId parameter in a url
employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get('SELECT * FROM Employee WHERE Employee.id = $employeeId', 
    {
        $employeeId: employeeId
    }, (err, employee) => {
        if(err){
            next(err);
        } else if(employee) {
            req.employee = employee;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

employeesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Employee WHERE Employee.is_current_employee = 1`,
    (err, employees) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({employees: employees});
        }
    });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee});
  });

employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name;
    const position = req.body.employee.position;
    const wage = req.body.employee.wage;
    const is_current_employee = req.body.employee.is_current_employee;
    if(!name || !position || !wage || !is_current_employee) {
        return res.sendStatus(400);
    } else {
        db.run(`INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)`,
        {
            $name: name,
            $position: position,
            $wage: wage,
            $isCurrentEmployee: isCurrentEmployee
        }, function(err) {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
                (err, newEmployee) => {
                    res.status(201).json({employee: newEmployee});
                });
            }
        });
    }
});


module.exports = employeesRouter;