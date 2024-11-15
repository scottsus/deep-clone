import asyncio
from prisma import Prisma

async def main() -> None:
    prisma = Prisma()
    await prisma.connect()

    users = await prisma.user.find_many()

    print(users)

    await prisma.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
