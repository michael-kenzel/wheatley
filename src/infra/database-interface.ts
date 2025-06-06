import { strict as assert } from "assert";
import { RequireAtLeastOne } from "../utils/typing.js";
import { is_string } from "../utils/strings.js";
import { Mutex } from "../utils/containers.js";

import * as mongo from "mongodb";
import { wheatley_database_credentials } from "../wheatley.js";

type ProxyDescriptor = { [key: string]: mongo.Document };
type ProxyCollectionOptions<D extends ProxyDescriptor> = RequireAtLeastOne<{
    [k in keyof D]: mongo.CreateCollectionOptions & {
        timeseries?: mongo.TimeSeriesCollectionOptions & { timeField: keyof D[k]; metaField?: keyof D[k] };
    };
}>;
type ProxyInterface<D extends ProxyDescriptor> = { [k in keyof D]: mongo.Collection<D[k]> } & {
    ensure_collections: (options: ProxyCollectionOptions<D>) => Promise<void>;
};

export class WheatleyDatabase {
    private readonly mutex = new Mutex();

    private constructor(
        private readonly client: mongo.MongoClient,
        private readonly db: mongo.Db,
        private readonly collections: Map<string, mongo.Collection>,
    ) {}

    async close() {
        await this.client.close();
    }

    static async create(credentials: wheatley_database_credentials) {
        const [user, password] = [credentials.user, credentials.password].map(encodeURIComponent);
        const host = credentials.host ?? "localhost";
        const port = credentials.port ?? 27017;
        const url = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=DEFAULT&authSource=wheatley`;
        const client = new mongo.MongoClient(url);
        await client.connect();
        const db = client.db("wheatley");
        const collections = await db.collections();
        return new WheatleyDatabase(client, db, new Map(collections.map(c => [c.dbName, c])));
    }

    get_collection(name: string, options: { create: false }): mongo.Collection | null;
    get_collection(name: string): mongo.Collection;
    get_collection(name: string, options?: { create: false }) {
        const collection = this.collections.get(name);
        if (collection) {
            return collection;
        }
        if (options) {
            return null;
        }
        const new_collection = this.db.collection(name);
        this.collections.set(name, new_collection);
        return new_collection;
    }

    create_proxy<D extends ProxyDescriptor>() {
        return new Proxy(this, {
            get: (instance, key, _proxy) => {
                if (key in instance) {
                    return (instance as any)[key];
                } else if (is_string(key)) {
                    return instance.get_collection(key);
                } else {
                    assert(false);
                }
            },
        }) as ProxyInterface<D>;
    }

    async ensure_collections<D extends ProxyDescriptor>(options: ProxyCollectionOptions<D>) {
        for (const [key, value] of Object.entries(options)) {
            await this.db.createCollection(key, value);
        }
    }

    async lock() {
        await this.mutex.lock();
    }

    unlock() {
        this.mutex.unlock();
    }
}
