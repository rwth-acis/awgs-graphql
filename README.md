# awgs-graphql
A lightweight but highly experimental GraphQL Web service for the AWGS database.

## Running
Copy the .env.TEMPLATE file, rename it to `.env` and fill in the values. The original AWGS database
is only reachable from within our subnetwork.

Install packages with `npm install`. Start with `npm start`.

Please note, that the in-browser GraphiQL Web IDE for GraphQL at `http://localhost:4000/graphql` is
only working if you set an Authorization header: `{"Authorization": "Bearer YOUR_TOKEN"}`. You can get
the token from our OIDC instance.

Have fun!
