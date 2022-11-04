require("dotenv").config();
const app = require("./index");

app.listen(process.env.PORT, () => console.log(`Server is up on port: ${process.env.PORT}`));
