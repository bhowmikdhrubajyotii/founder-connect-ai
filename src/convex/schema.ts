import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // add other tables here

    // FoundrMatch: the signed-in founder's onboarding profile
    founderProfiles: defineTable({
      userId: v.id("users"),
      name: v.string(),
      vision: v.string(),
      stage: v.string(),
      industries: v.array(v.string()),
      gaps: v.array(v.string()),
      commitment: v.string(),
      equity: v.string(),
      workStyle: v.string(),
      lookingFor: v.string(),
      parsedSkills: v.optional(v.array(v.string())),
      radar: v.optional(
        v.object({
          Tech: v.number(),
          Product: v.number(),
          Growth: v.number(),
          Ops: v.number(),
        }),
      ),
    }).index("by_user", ["userId"]),

    // FoundrMatch: deck actions (coffee chat, NDA/deck request, pass)
    founderActions: defineTable({
      userId: v.id("users"),
      founderId: v.string(),
      action: v.union(
        v.literal("coffee"),
        v.literal("nda"),
        v.literal("pass"),
      ),
    }).index("by_user", ["userId"]),

    // Founder Connect AI: thread comments on founder profiles
    founderComments: defineTable({
      userId: v.id("users"),
      founderId: v.string(),
      body: v.string(),
      authorName: v.optional(v.string()),
    })
      .index("by_founder", ["founderId"])
      .index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
