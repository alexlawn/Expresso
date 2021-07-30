const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId`,
    {
        $timesheetId: timesheetId
    },
    (err, timesheet) => {
        if(err) {
            next(err);
        } else if (timesheet) {
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

timesheetsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId`,
    {
        $employeeId: req.params.employeeId
    },
    (err, timesheet) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({timesheets: timesheet});
        }
    });
});

timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;
    db.get(`SELECT * FROM Employee WHERE Employee.id = $employeeId`,
    {$employeeId: employeeId},
    (err, employee) => {
        if(err) {
            next(err);
        } else {
            if (!hours || !rate || !date || !employee) {
                return res.sendStatus(400);
            }
            db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)`,
            {
                $hours: hours,
                $rate: rate,
                $date: date,
                $employeeId: req.params.employeeId
            },
            function(err) {
                if(err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
                    (err, newTimesheet) => {
                        res.status(201).json({timesheet: newTimesheet});
                    });
                }
            });
        }
    });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;
    const employeeId = req.params.employeeId;
    db.get(`SELECT * FROM Employee WHERE Employee.id = $employeeId`,
    {$employeeId: employeeId},
    (err, employee) => {
        if(err) {
            next(err);
        } else {
            if(!hours || !rate || !date || !employee) {
                return res.sendStatus(400);
            } else {
                db.run(`UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE Timesheet.id = $timesheetId`,
                {
                    $employeeId: employeeId,
                    $timesheetId: req.params.timesheetId,
                    $hours: hours,
                    $rate: rate,
                    $date: date
                },
                function(err) {
                    if(err) {
                        next(err);
                    } else {
                        db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`,
                        (err, updatedTimesheet) => {
                            res.status(200).json({timesheet: updatedTimesheet});
                        });
                    }
                });
            }
        }
    });
});


module.exports = timesheetsRouter;