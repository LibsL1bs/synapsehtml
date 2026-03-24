import postgres from "postgres";
const sql = postgres('postgres://postgres:12345678@localhost:5432/postgres');
export default sql;