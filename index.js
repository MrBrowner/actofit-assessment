// Imports
const express = require('express');
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');

// DB file name, auto save after push, db human readable format, separator
var db = new JsonDB(new Config("myDataBase", true, false, '~'));

// Initialise the app
const app = express();

// middlewares..
// security checks..

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sends message for default URL
app.get('/', (req, res) => {
    // db.push("~employees[]", {
    //     id: 0,
    //     name: "zero",
    //     role: 0,
    //     age: 0,
    //     gender: "x"
    // }, true);
    res.json({ message: 'Hola!' });
});

// CRUD employee
app.get('/v1/employees/', (req, res) => {
    let result = "";
    try {
        result = db.getData("~employees");
    } catch (error) {
        res.json({ message: "No Data Found!", error: true });
        return;
    }
    res.json({ data: result });
});

app.get('/v1/employees/:id', (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.json({ message: "ID required!", error: true });
        return;
    }
    try {
        const employees = db.getData("~employees");
        let result = employees.find((emp) => emp.id == id);
        if (result != undefined) {
            res.json({ data: result });
        } else {
            res.json({ message: `Employee Not found!`, error: true });
        }
    } catch (error) {
        console.log(error);
        res.json({ message: "Employee not found!", error: true });
        return;
    }
});

app.post('/v1/employees/', (req, res) => {
    //console.log(JSON.stringify(req.body));
    const name = req.body.name;
    const role = req.body.role;
    const age = req.body.age;
    const gender = req.body.gender;

    if (name != undefined && role != undefined && age != undefined && gender != undefined) {
        try {
            const employees = db.getData("~employees");
            const idx = employees.findIndex((emp) => emp.name == name);

            if (idx == -1) {
                const emp_object = {
                    id: (employees.length) + 1, name: name, role: role, age: age, gender: gender
                };
                db.push("~employees[]", emp_object, true);
                res.json({ data: emp_object });
            } else {
                res.json({ message: "Employee already exists!", error: true });
            }
        } catch (error) {
            res.json({ message: "DB operation failed!", error: true });
        }
    } else res.json({ message: "Required fields are missing", error: true });
});

app.put('/v1/employees/:id', (req, res) => {
    const id = req.params.id;
    const name = req.body.name;
    const role = req.body.role;
    const age = req.body.age;
    const gender = req.body.gender;

    if (id != undefined && name != undefined && role != undefined && age != undefined && gender != undefined) {
        try {
            const employees = db.getData("~employees");
            const idx = employees.findIndex((emp) => emp.id == id);

            if (idx != -1) {
                const emp_object = {
                    id: id, name: name, role: role, age: age, gender: gender
                };
                db.push("~employees[" + idx + "]", emp_object, true);
                res.json({ data: emp_object });
            } else {
                res.json({ message: "Employee not found!", error: true });
            }
        } catch (error) {
            res.json({ message: "DB operation failed!", error: true });
        }
    } else res.json({ message: "Required fields are missing", error: true });
});

app.patch('/v1/employees/:id', (req, res) => {
    const id = req.params.id;
    // pending...
});

app.delete('/v1/employees/:id', (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.json({ message: "ID required!", error: true });
        return;
    }
    try {
        const employees = db.getData("~employees");
        const idx = employees.findIndex((emp) => emp.id == id);
        if (idx != -1) {
            db.delete('~employees[' + idx + ']');
            res.json({ message: "Success", error: false })
        } else {
            res.json({ message: `Employee Not found!`, error: true });
        }
    } catch (error) {
        res.json({ message: "DB operation failed!", error: true });
    }
});

app.all('/', function (req, res) {
    //Create an error and pass it to the next function
    var err = new Error("Something went wrong");
    next(err);
});

//An error handling middleware
app.use(function (err, req, res, next) {
    res.status(500);
    res.send("Oops, something went wrong.")
});

// Launch app to listen to specified port
app.listen(8666, () => console.log("Running on port 8666"));