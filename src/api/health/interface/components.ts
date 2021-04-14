import Db from "./db";
import DiskSpace from "./disk-space";
import Ping from "./ping";
import Rabbit from './rabbit';

export default interface Components {
    db: Db;
    diskSpace: DiskSpace;
    ping: Ping;
    rabbit: Rabbit;
}
