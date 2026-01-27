import asyncio
import asyncpg

async def main():
    try:
        conn = await asyncpg.connect('postgresql://postgres:postgres@localhost/aura_db')
        rows = await conn.fetch('SELECT * FROM alembic_version')
        print("Alembic Versions:")
        for r in rows:
            print(dict(r))
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
