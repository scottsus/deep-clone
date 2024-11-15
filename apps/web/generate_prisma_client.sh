#!/bin/bash


# If getting this error:
#
#    /bin/sh: ./generate_prisma_client.sh: Permission denied
#
# Make sure to provide +x permissions
#
#    chmod +x ./generate_prisma_client.sh
#    yarn prisma


# Prisma has a very strange behavior where it does not accept any other .env file besides
# the .env file that lives in the /prisma folder.
#
# https://github.com/prisma/prisma/issues/11050
# https://github.com/prisma/prisma/issues/10104
#
# Ideally, we'd want to have in our package.json a script like so
# "prisma": "dotenv -e ../../packages/database/.env -- prisma generate --schema='../../packages/database/prisma/schema.prisma' --generator js"
#
#
# However this is currently not possible, and this workaround is required


cd ../../packages/database
npx prisma generate --schema='../../packages/database/prisma/schema' --generator js
