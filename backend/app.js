
const express = require('express');
const {open} = require('sqlite');
const sqlite3 = require('sqlite3');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');
const dbPath = path.join(__dirname, 'techdome.db');
const app = express();
app.use(express.json());
app.use(cors());

let db = null;

// intialize DB Server

const initializeDbServer = async() => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
        app.listen(3000, () => {
            console.log("server run at 3000 port");
        })
    }catch(e) {
        console.log(e.message);
    }
}

initializeDbServer();

// check user login

app.post("/login", async(request, response) => {
    const {userDetails} = request.body;
    const {email} = userDetails;
    const checkedUser = `SELECT * FROM users WHERE email = '${email}';`;
    const dbUser = await db.get(checkedUser);
    if (dbUser === undefined) {
        response.status(400);
        response.send("invalid user");
    }else {
        const payload = {
            email: email
        }
        const jwtToken = jwt.sign(payload, "My_Secrect_Key");
        const token = {
            jwtToken: jwtToken
        }
        console.log(token);
        response.send(token);
    }
});

//Authentication with JWT Token
const authenticationToken = (request, response, next) => {
    let jwtToken;
    const authHeader = request.headers["authorization"];
    if (authHeader === undefined) {
        response.status(401);
        response.send("Invalid Jwt Token");
    }else {
        jwtToken = authHeader.split(" ")[1];
        jwt.verify(jwtToken, "My_Secrect_Key", async(error, payload) => {
            if (error) {
                response.status(401);
                response.send("Invalid Jwt Token");
            }else {
                request.email = payload.email;
                next();
            }
        });
    }
};

const adminAuthentication = (request, response, next) => {
    let jwtToken;
    const {role} = request.query;
    const authHeader = request.headers["authorization"];
    if (authHeader === undefined) {
        response.status(401);
        response.send("invalid admin");
    }else {
        jwtToken = authHeader.split(" ")[1];
        jwt.verify(jwtToken, "My_Secrect_Key", async(error, payload) => {
            if (role === "admin") {
                request.email = payload.email;
                next();
            }else {
                response.status(401);
                response.send("invalid admin");
            }
        });
    }
};

// customer create loans

app.post("/loans", authenticationToken, async(request, response) => {
    try {
        const {id, customerId, amount, term, status} = request.body;
        const addLoanQuery = `INSERT INTO 
            loans (id, customer_id, amount, term, status)
            VALUES
            (
                '${id}',
                '${customerId}',
                ${amount},
                ${term},
                '${status}'
            );`;
        const addLoanDetails = await db.run(addLoanQuery);
        response.send("successfully add loan details");
    }
    catch(e) {
        console.log(e.message);
    }
})

// admin approved loans status 

app.put("/loans/:loanId/", adminAuthentication, async(request, response) => {
    const {loanId} = request.params;
    const {role} = request.query;
    const {status} = request.body;
    const updateStatusQuery = `
        UPDATE 
            loans
        SET
            status = '${status}'
        WHERE 
            id = '${loanId}' AND role = '${role}';    
    `;
    const responseData = await db.run(updateStatusQuery);
    response.send("successfully updated");
})

// get loan details 

app.get("/loans", authenticationToken, async(request, response) => {
    const getLoanQuery = `SELECT * FROM loans;`;
    const getLoanDetails = await db.all(getLoanQuery);
    response.send(getLoanDetails);
});


app.post("/repayments", authenticationToken, async(request, response) => {
    const {loanId, amount, term} = request.body;
    const checkedLoanQuery = `SELECT * FROM repayments WHERE loan_id = '${loanId}';`;
    const checkedLoan = await db.get(checkedLoanQuery);
    const repayments = [];
    if (checkedLoan === undefined) {
        response.status(400);
        response.send("Repayment amount too low or no pending repayments");
    }else if (term === 0){
        const updateStatusRepaymentQuery = `UPDATE FROM loans WHERE id = ${loanId};`;
        await db.run(updateStatusRepaymentQuery);
        response.status(200);
        response.send("no pending repayments")  
    }else {
        for (let i = 0; i < term; i++) {
            const scheduledDate = new Date();
            scheduledDate.setDate(scheduledDate.getDate() + 7 * (i + 1));
            const amount = i === term - 1 ? weeklyAmount + 0.01 : weeklyAmount; // Adjust for rounding on last payment
            const repaymentId = uuidv4();
            repayments.push({id: repaymentId, loanId: loanId, scheduledDate: scheduledDate.toISOString(), amount: amount, status: 'PENDING'});
        }
        repayments.map(payment => {
            const {id, loanId, scheduledDate, amount, status} = payment
            const addRepaymentsQuery = `
                INSERT INTO
                    repayments(id, loan_id, scheduled_date, amount, status)
                VALUES
                    (
                        '${id}',
                        '${loanId}',
                        '${scheduledDate}',
                        ${amount},
                        '${status}'
                    )
            ;`;
            db.run(addRepaymentsQuery);
            response.send('successfully add repayments');

        });
    }

})




module.exports = app;
