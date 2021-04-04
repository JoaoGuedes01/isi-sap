const hana = require('@sap/hana-client');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const port = 8080;
const conn = hana.createConnection();
const path = require('path');
const conn_params = {
    serverNode: 'e02ee0c0-925b-4d61-a958-609421a5ccca.hana.trial-us10.hanacloud.ondemand.com:443',
    uid: 'DBADMIN',
    pwd: 'Pirocas123'
};
const dbcon = conn.connect(conn_params, function (err) {
    if (err) console.log("Error");
    console.log("DB Connected");
});

app.use(bodyParser.json())

app.get('/api/users', (req, res) => {
    conn.exec('SELECT * FROM CONAS.USER;', function (err, result) {
        if (err) throw err;
        return res.send(result);
    });
});

app.post('/api/login', (req, res) => {
    let data = {
        username: req.body.username,
        password: req.body.password
    }

    conn.exec("SELECT * FROM CONAS.USER WHERE username='" + data.username + "';", function (err, result) {
        if (err) throw err;
        if (!result[0]) return res.send({ message: "Nao ha users com esse username" });
        corret_password = result[0].PASSWORD;
        if (data.password != corret_password) return res.send({ message: "Password incorreta" });
        return res.send({
            estado: 1,
            message: "Login com sucesso :D"
        });
    });
});

app.post('/api/users', (req, res) => {
    let data = {
        username: req.body.username,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        password: req.body.password,
        passwordConf: req.body.passwordConf
    }

    if (data.password != data.passwordConf) return res.send({ message: "Passwords nao sao iguais" })

    conn.exec("SELECT * FROM CONAS.USER WHERE username='" + data.username + "';", function (err, result) {
        if (err) throw err;
        console.log(result);
        if (result[0]) return res.send({ message: "Ja existe um user com esse username" });
        conn.exec("INSERT INTO CONAS.USER (username,first_name,last_name,password) VALUES ('" + data.username + "','" + data.first_name + "','" + data.last_name + "','" + data.password + "');", function (err) {
            if (err) throw err;
            return res.send({ message: "User criado com successo" });
        });
    });

});

app.get('/frontend/register', (req, res) => {
    res.sendFile(path.join(__dirname, './HTML', 'register.html'));
})

app.get('/frontend/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, './HTML', 'dashboard.html'));
})

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, './HTML', 'login.html'));
});

app.listen(port, () => {
    console.log("Server listening on port " + port);
})