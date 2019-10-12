Backend of [KatCafe](https://katcafe.org) built in node.js and Redis as a database.

# Installation

```
npm install
```

### Installing local database

```
sudo apt-get install redis-server
```
Testing it Redis works
```
$ redis-cli ping
```
should output `PONG`

(optional) Edit redis port & password
```
sudo nano /etc/redis/redis.conf
```

After editing it is required to restart redis
```
sudo systemctl restart redis.service
```

Generate Vapid Keys for notifications-subscriptions

```
npm run generate-vapid-keys
```

Configure `consts/consts-secret.js` with the Redis credentials:

```
export default {

    redis: {
        host: {
            address:'',
            port: 6379,
        },
        db: 7,
        pswd: '',
    },

    crypto: {

        KEY: Buffer.alloc(32), //USED IN ENCRYPTION
        IV: Buffer.alloc(16), //USED IN ENCRYPTION

        SECRET: Buffer.alloc(16), //used in SHA
    },

    vapid:{
        publicKey: '',
        privateKey: '',
        email: '',
    }

}
```

# Running

```
npm run start
```


# Deploy PM2

#### build it

```
npm run start
pm2 restart `processId` --name back
```

#### new version

```
pm2 restart back
```

