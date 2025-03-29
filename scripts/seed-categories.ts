import { db } from "@/db";
import { categoriesTable } from "../db/schema";

const categoryNames = [
  "Entertainment",
  "Music",
  "Sports",
  "Gaming",
  "Education",
  "Science & Technology",
  "Travel & Events",
  "News & Politics",
  "Comedy",
  "Film & Animation",
  "Howto & Style",
  "People & Blogs",
  "Pets & Animals",
  "Autos & Vehicles",
  "Nonprofits & Activism",
  "Documentaries",
  "Cooking & Food",
  "Fitness & Health",
  "Art & Design",
  "Beauty & Fashion",
  "DIY & Crafts",
  "Finance & Business",
  "Outdoors & Nature",
  "Lifestyle",
  "Parenting & Family",
  "Spiritual & Religion",
  "History",
  "Literature & Books",
  "Technology Reviews",
  "Photography",
  "Animation",
  "Virtual Reality",
  "ASMR",
  "True Crime",
  "Vlogs",
  "Unboxing",
  "Challenges",
  "Pranks",
  "Tutorials",
  "Live Streaming",
];

/**
 * Seeds the categories table with predefined category names
 */
async function seedCategories() {
  console.log("🌱 Seeding categories...");

  try {
    const categories = categoryNames.map((name) => ({
      name,
      description: `Videos related to ${name.toLowerCase()}`,
    }));

    const result = await db
      .insert(categoriesTable)
      .values(categories)
      .onConflictDoNothing({ target: categoriesTable.name })
      .returning();

    console.log(`✅ Successfully seeded ${result.length} categories`);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  }
}

if (require.main === module) {
  seedCategories()
    .then(() => {
      console.log("Seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
