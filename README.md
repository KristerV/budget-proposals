# Helium budget proposal

A Budget Proposal system for Helium Payments.

## How to run

1. Clone this repo.
1. Install dependencies: `npm install`
1. Install [docker](https://www.docker.com/) (and docker-compose).
1. Start the docker daemon with `systemctl start docker` (Linux)
4. Build the docker images: `docker-compose build` (re-run whenever Dockerfile or package.json changes)
5. Start the containers: `docker-compose up`
6. Run the migrations: `docker-compose exec api npm run db:migrations:run`
7. Wait until blockchain is downloaded. Check progress on [localhost:3000](http://localhost:3000/v0/core/raw-cli/blockchain/getblockcount).
8. Also run [the frontend](https://github.com/KristerV/heliumpay-budgetweb-frontend).

**Notes**

- You may need to use `sudo` with some commands.
- You may even need a reboot if you just installed docker.

This will start the app along with `dashd`. Also run [the frontend](https://github.com/KristerV/heliumpay-budgetweb-frontend).

### Mailer

To enable the mailer, `process.env.MAILGUN_API_KEY` and `process.env.MAILGUN_DOMAIN` must be set:

```bash
export MAILGUN_API_KEY=[api-key] && export MAILGUN_DOMAIN=[domain] && docker-compose up
```

### Tests
Run the test suite:
```
npm run test
npm run test */**/createUser.test.js # run tests for a specific file
npm run test */**/user/*.test.js # run tests for a specific directory
npm run test -- --verbose
```

Tests are run against a separate test database. Make sure you run `docker-compose up` first. Migrations are automatically run during tests.

## API design

```
v0                                      // Alpha version, subject to constant change
GET   v0/comments?proposalHash=         // Get all comments for a proposal
POST  v0/comments                       // Create a new comment
PUT   v0/comments/:id                   // Update a comment by id
DEL   v0/comments/:id                   // Delete a comment by id
POST  v0/comments/:id/vote              // Vote on a comment  
GET   v0/core/proposals                 // All proposals
GET   v0/core/proposals/:hash           // Single proposal
GET   v0/core/raw-cli/*                 // Raw data from the cli
POST  v0/login                          // Login with username (or email) and password
POST  v0/login/sendPasswordResetEmail   // Trigger password reset workflow for provided email
POST  v0/users                          // Create a new user
GET   v0/users/:id                      // Fetch a user by id
PUT   v0/users/:id                      // Updates a user by id
POST  v0/users/:id/confirmEmail         // Confirms the users email with short-lived token
POST  v0/users/:id/resetPassword        // Updates the users password with short-lived token
```

### Middleware
Middleware adds common behaviour to routes handlers.

- [auth](/v0/middleware/auth.js) enables JWT authentication with an optional set of scopes
- [hashid](/v0/middleware/hashid.js) automatically decodes ids in request parameters / tokens and encodes ids in the payload
- [errors](/v0/middleware/errors.js) handles errors that occur in the handlers
- [json](/v0/middleware/index.js) parses the request body as json

### Auth scopes
Auth scopes are used to allow JWTs to perform a subset of actions against the api. The set of scopes can be found in [scopes.js](/v0/scopes.js).

- `user:*` allows access the auth token to user create, get and update (created by logging in)
- `user:resetPassword` allows the auth token to reset the users password (created by reset password workflow)
- `user:confirmEmail` allows the auth token to confirm the email address (created by email confirmation workflow)

## Database migrations
Creates a new migration file in database/migrations:
```
npm run db:migrations:make [name]
```

Runs migrations inside the docker container (run _docker-compose up_ first):
```
docker-compose exec api npm run db:migrations:run
```

Rollback the latest migration from within the docker container:
```
docker-compose exec api npm run db:migrations:rollback
```

# Links

## Info

- [Dash budget stages](https://github.com/dashpay/dash/blob/master/doc/masternode-budget.md)

## Interesting dash services

- https://www.dashforcenews.com/
- http://dashmasternode.org
- https://www.dashninja.pl/masternodes.html
- https://dash-news.de/dashtv/#value=1000
- http://178.254.23.111/~pub/Dash/Dash_Info.html
- https://dashradar.com/

## API design guidelines

- http://microcosm-cc.github.io/
- http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api
- https://api.github.com/
- https://docs.stormpath.com/rest/product-guide/latest/reference.html
- https://stripe.com/docs/api
- https://plaid.com/docs/api/
- https://developers.digitalocean.com/documentation/v2/
- https://developers.google.com/drive/v2/reference/#Children
- https://postgrest.com/en/v4.1/intro.html - tool
