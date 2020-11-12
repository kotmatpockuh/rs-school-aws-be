const { DB_HOST, DB_PORT, DB_DATABASE, DB_USER, DB_PASSWORD } = process.env;

export const dbOptions = {
    host: DB_HOST,
    port: DB_PORT,
    database: DB_DATABASE,
    user: DB_USER,
    password: DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false, // to avoid warring in this example
    },
    connectionTimeoutMillis: 5000, // time in millisecond for termination of the database query
};
