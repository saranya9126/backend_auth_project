const express = require("express");
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const app = express();

app.use(express.json());


app.get("/", (req, res) => {
    res.send("Hello World");
})

app.post('/register', async (req, res) => {

    try {
        //data from the user
        const data = req.body;
        //db operations
        const userExists = await prisma.user.findUnique({

            where: {
                email_id: data.email_id
            }
        })

        if (userExists) {
            return res.status(400).send("User already exists");
        }
        else {

            const hashedPassword = await bcrypt.hash(data.password, 10);
            const newUser = await prisma.user.create({

                data: {

                    email_id: data.email_id,
                    password: hashedPassword,
                    phone_number: data.phone_number,
                }


            })
            const { password, ...userWithoutPassword } = newUser;
            res.status(201).send({ message: "User registered successfully", data: userWithoutPassword });
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
})

app.post("/login", async (req, res) => {

    try {
        const data = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email_id: data.email_id
            }
        })
        if (!user) {
            return res.status(400).send("User email doesnot exist found.register first");
        }
        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send("Invalid password");
        }
        const { password, ...userWithoutPassword } = user;
        res.status(200).send({ message: "Login successful", data: userWithoutPassword });


    } catch (error) {
        res.status(500).send("Internal Server Error" + error.message);
    }
})
app.listen(3000, () => {
    console.log("server started in port 3000");

})