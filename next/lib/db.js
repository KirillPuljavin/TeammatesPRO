import Database from "better-sqlite3";
const db = new Database("./database/data.sqlite", { verbose: console.log });

export default db;
