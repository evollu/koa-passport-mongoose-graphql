import app from './server';
import {
    connectDatabase
} from './server/db';
import {
    development,
    production,
} from './server/db/config';

const port = process.env.PORT || 4000;
const databaseConfing = (process.env.NODE_ENV === 'production') ? production : development;

(function *() {
    try {
        const info = yield connectDatabase(databaseConfing);
        console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
    } catch (error) {
        console.error('Unable to connect to database');
    }

    yield app.listen(port);
    console.log(`Server started on port ${port}`);
})();