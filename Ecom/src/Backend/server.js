import app from "./app.js";
import db from './config/database.js'

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});