const express = require("express");
var { graphql, buildSchema } = require('graphql');
var graphqlHTTP = require('express-graphql');


// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
input ContactInput {
  contactType: String
  contactNumber: String
}

input UserInput {
    name: String
    contact: [ContactInput]
  }

type Contact {
  contactType: String
  contactNumber: String
}

  type User {
    id: ID!
    name: String
    contact: [Contact]
  }

  type Query {
    getUser(id: ID!): User
    getContactByType(id: ID!, type: String): User
  }

  type Mutation {
    createUser(input: UserInput): User
    updateUser(id: ID!, input: UserInput): User
  }
`);

class Contact {
  constructor({contactType, contactNumber}) {
    this.contactType = contactType;
    this.contactNumber = contactNumber;
  }
}
class User {
  constructor(id, {name, contact}) {
    this.id = id;
    this.name = name;
    const contacts = contact.map((c) => {
      return new Contact(c);
    })
    this.contact = contacts;
  }
}
var dummyDB = {};

var root = {
  getUser: ({user_id}) => {
    if (!dummyDB[user_id]) {
      throw new Error('no User exists with id ' + user_id);
    }
    return new User(user_id, dummyDB[id]);
  },
  getContactByType: ({id, type}) => {
    const user = dummyDB[id];
    const contact = user.contact.filter((c) => c.contactType === type);
    return new User(id, {...user, contact});
  },
  createUser: ({input}) => {
    var user_id = require('crypto').randomBytes(10).toString('hex');
    dummyDB[user_id] = input;
    return new User(user_id, input);
  },
  updateUser: ({id, input}) => {
    if (!dummyDB[id]) {
      throw new Error('no message exists with id ' + id);
    }
    dummyDB[id] = input;
    return new User(id, input);
  },
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

const port = 8080;
app.listen(port, () => {
  console.log("server is listening on port ", port);
});
