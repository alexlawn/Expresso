const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');



timesheetsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId`,
    {
        $employeeId: req.params.employeeId
    },
    (err, timesheets) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({timesheets: timesheets});
        }
    });
});





module.exports = timesheetsRouter;