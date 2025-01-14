const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//Post Book API
app.post("/books/", async (request, response) => {
  const bookDetails = request.body;
  const { name, img, summary } = bookDetails;
  const addBookQuery = `INSERT INTO
      book (name,img,summary)
    VALUES
      (
        '${name}',
         '${img}',
         '${summary}'
      );`;

  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastID;
  response.send({ id: bookId });
});

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `SELECT
      *
    FROM
      book
    ORDER BY
      id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const getBookQuery = `SELECT
      *
    FROM
      book
    WHERE
      id = ${bookId};`;
  const book = await db.get(getBookQuery);
  response.send(book);
});

//Put Book API
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const bookDetails = request.body;
  const { name, img, summary } = bookDetails;
  const updateBookQuery = `UPDATE
      book
    SET
      name='${name}',
      img='${img}',
      summary='${summary}'
      
    WHERE
      id = ${bookId};`;
  await db.run(updateBookQuery);
  response.send("Book Updated Successfully");
});

//Delete Book API
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const deleteBookQuery = `DELETE FROM 
      book 
    WHERE
      id = ${bookId};`;
  await db.run(deleteBookQuery);
  response.send("Book Deleted Successfully");
});
