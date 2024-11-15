#!/bin/bash

# For intellisense purposes only.
#
# For the most part, run docker-compose to build the Prisma client with the correct envs
# and run the FastAPI server there

prisma generate --schema="../../packages/database/prisma/schema" --generator py
