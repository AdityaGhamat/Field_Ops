import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.DATABASE_URL as string);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "TECHNICIAN",
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: "",
      },
      skills: {
        type: "string[]",
        required: false,
        defaultValue: [],
      },
      isAvailable: {
        type: "boolean",
        required: false,
        defaultValue: true,
      },
    },
  },
});
