import {
  makeSchema,
  nonNull,
  objectType,
  inputObjectType,
  arg,
  asNexusMethod,
} from 'nexus'
import { DateTimeResolver } from 'graphql-scalars'
import * as crypto from 'crypto'
import { sign, verify } from 'jsonwebtoken'

export const DateTime = asNexusMethod(DateTimeResolver, 'date')

const Mutation = objectType({
  name: 'Mutation',
  definition(t) {
    t.nonNull.field('signinUser', {
      type: 'AuthPayload',
      args: {
        data: nonNull(
          arg({
            type: 'UserSigninInput',
          }),
        ),
      },
      resolve: async (_, args, context) => {
        const user = await context.prisma.user.findFirst({
          where: {
            email: args.data.email,
            password: crypto
              .createHash('sha1')
              .update(args.data.password)
              .digest('hex'),
          },
        })

        let token = null
        if (user) {
          token = await sign(user, 'password!23')
        }

        return {
          user,
          token,
        }
      },
    })

    t.nonNull.field('profile', {
      type: 'ProfilePayload',
      args: {
        data: nonNull(
          arg({
            type: 'ProfileInput',
          }),
        ),
      },
      resolve: async (_, args, context) => {
        const token = args.data.token
        async function verifyToken(token: any) {
          try {
            return verify(token, 'password!23')
          } catch (err) {
            return null
          }
        }

        const tokenPayload: any = verifyToken(token).then((res) => {
          if (res) {
            return context.prisma.user.findUnique({
              where: { id: res.id },
            })
          }
          return { id: null, name: null, email: null }
        })

        return tokenPayload
      },
    })

    t.nonNull.field('signupUser', {
      type: 'User',
      args: {
        data: nonNull(
          arg({
            type: 'UserCreateInput',
          }),
        ),
      },
      resolve: (_, args, context) => {
        return context.prisma.user.create({
          data: {
            name: args.data.name,
            email: args.data.email,
            password: crypto
              .createHash('sha1')
              .update(args.data.password)
              .digest('hex'),
          },
        })
      },
    })
  },
})

const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.int('id')
    t.string('name')
    t.nonNull.string('email')
    t.nonNull.string('password')
  },
})

const UserCreateInput = inputObjectType({
  name: 'UserCreateInput',
  definition(t) {
    t.nonNull.string('email')
    t.string('name')
    t.nonNull.string('password')
  },
})

const UserSigninInput = inputObjectType({
  name: 'UserSigninInput',
  definition(t) {
    t.nonNull.string('email')
    t.nonNull.string('password')
  },
})

const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.string('token')
    t.field('user', { type: 'User' })
  },
})

const ProfilePayload = objectType({
  name: 'ProfilePayload',
  definition(t) {
    t.string('id')
    t.string('name')
    t.string('email')
  },
})

const profileInput = inputObjectType({
  name: 'ProfileInput',
  definition(t) {
    t.nonNull.string('token')
  },
})

export const schema = makeSchema({
  types: [
    Mutation,
    UserCreateInput,
    UserSigninInput,
    profileInput,
    User,
    DateTime,
    AuthPayload,
    ProfilePayload,
  ],
  outputs: {
    schema: __dirname + '/../schema.graphql',
    typegen: __dirname + '/generated/nexus.ts',
  },
  contextType: {
    module: require.resolve('./context'),
    export: 'Context',
  },
  sourceTypes: {
    modules: [
      {
        module: '@prisma/client',
        alias: 'prisma',
      },
    ],
  },
})
