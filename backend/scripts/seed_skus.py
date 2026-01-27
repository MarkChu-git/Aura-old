import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.db.session import AsyncSessionLocal
from app.db.models.sku import SKU


async def seed_skus():
    skus = [
        SKU(
            name="Santal 33",
            brand="Le Labo",
            url="https://www.lelabofragrances.com/santal-33.html",
            tags={
                "family": "Woody",
                "notes": ["sandalwood", "cedar", "cardamom", "leather", "papyrus"],
                "mood": "iconic",
            },
        ),
        SKU(
            name="Tam Dao",
            brand="Diptyque",
            url="https://www.diptyqueparis.com/en_us/p/tam-dao-eau-de-toilette-100ml.html",
            tags={
                "family": "Woody",
                "notes": ["sandalwood", "cedar", "cypress", "rosewood"],
                "mood": "meditative",
            },
        ),
        SKU(
            name="Philosykos",
            brand="Diptyque",
            url="https://www.diptyqueparis.com/en_us/p/philosykos-eau-de-toilette-1.html",
            tags={
                "family": "Fresh",
                "notes": ["fig leaf", "fig milk", "fig wood", "pepper"],
                "mood": "natural",
            },
        ),
        SKU(
            name="Baccarat Rouge 540",
            brand="Maison Francis Kurkdjian",
            url="https://www.franciskurkdjian.com/us-en/p/baccarat-rouge-540-eau-de-parfum.html",
            tags={
                "family": "Oriental",
                "notes": ["jasmine", "saffron", "amberwood", "ambergris"],
                "mood": "luxurious",
            },
        ),
        SKU(
            name="Gypsy Water",
            brand="Byredo",
            url="https://www.byredo.com/us_en/gypsy-water-eau-de-parfum-100ml",
            tags={
                "family": "Woody",
                "notes": ["juniper", "lemon", "bergamot", "pepper", "pine needles"],
                "mood": "bohemian",
            },
        ),
        SKU(
            name="Mojave Ghost",
            brand="Byredo",
            url="https://www.byredo.com/us_en/mojave-ghost-eau-de-parfum-100ml",
            tags={
                "family": "Floral",
                "notes": ["ambrette", "nesberry", "violet", "sandalwood", "musk"],
                "mood": "desert",
            },
        ),
        SKU(
            name="Fleur de Peau",
            brand="Diptyque",
            url="https://www.diptyqueparis.com/en_us/p/fleur-de-peau-eau-de-parfum.html",
            tags={
                "family": "Floral",
                "notes": ["musk", "iris", "ambrette", "pink peppercorns"],
                "mood": "intimate",
            },
        ),
        SKU(
            name="Tacit",
            brand="Aesop",
            url="https://www.aesop.com/us/p/fragrance/citrus/tacit-eau-de-parfum/",
            tags={
                "family": "Fresh",
                "notes": ["yuzu", "basil", "clove", "vetiver"],
                "mood": "vivacious",
            },
        ),
        SKU(
            name="Hwyl",
            brand="Aesop",
            url="https://www.aesop.com/us/p/fragrance/woody/hwyl-eau-de-parfum/",
            tags={
                "family": "Woody",
                "notes": ["cypress", "frankincense", "vetiver", "thyme"],
                "mood": "mystical",
            },
        ),
        SKU(
            name="Jazz Club",
            brand="Maison Margiela",
            url="https://www.maisonmargiela-fragrances.us/en/product/jazz-club",
            tags={
                "family": "Oriental",
                "notes": ["pink pepper", "rum", "tobacco", "vanilla"],
                "mood": "boozy",
            },
        ),
    ]

    async with AsyncSessionLocal() as session:
        for sku in skus:
            session.add(sku)
        await session.commit()
    print(f"Seeded {len(skus)} SKUs.")


if __name__ == "__main__":
    asyncio.run(seed_skus())
