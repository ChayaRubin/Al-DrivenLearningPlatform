import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { phone: '+10000000000' },
    update: {},
    create: {
      name: 'Admin',
      phone: '+10000000000',
      role: 'ADMIN',
    },
  });
  console.log('Admin user:', admin.name, admin.phone);

  let cat1 = await prisma.category.findFirst({ where: { name: 'Programming' } });
  if (!cat1) {
    cat1 = await prisma.category.create({ data: { name: 'Programming' } });
    await prisma.subCategory.createMany({
      data: [
        { name: 'JavaScript', categoryId: cat1.id },
        { name: 'TypeScript', categoryId: cat1.id },
      ],
    });
  }

  let cat2 = await prisma.category.findFirst({ where: { name: 'Mathematics' } });
  if (!cat2) {
    cat2 = await prisma.category.create({ data: { name: 'Mathematics' } });
    await prisma.subCategory.create({
      data: { name: 'Algebra', categoryId: cat2.id },
    });
  }

  // Ensure we have subcategories (in case they already existed)
  const js = await prisma.subCategory.findFirst({
    where: { name: 'JavaScript', categoryId: cat1.id },
  });
  const ts = await prisma.subCategory.findFirst({
    where: { name: 'TypeScript', categoryId: cat1.id },
  });
  const algebra = await prisma.subCategory.findFirst({
    where: { name: 'Algebra', categoryId: cat2.id },
  });
  const subJs =
    js ?? (await prisma.subCategory.create({ data: { name: 'JavaScript', categoryId: cat1.id } }));
  const subTs =
    ts ?? (await prisma.subCategory.create({ data: { name: 'TypeScript', categoryId: cat1.id } }));
  const subAlgebra =
    algebra ??
    (await prisma.subCategory.create({ data: { name: 'Algebra', categoryId: cat2.id } }));

  // Seed user for history (optional; or use admin)
  const seedUser = await prisma.user.upsert({
    where: { phone: '+11111111111' },
    update: {},
    create: { name: 'Alex', phone: '+11111111111', role: 'USER' },
  });

  const existingPromptCount = await prisma.prompt.count();
  if (existingPromptCount === 0) {
    await prisma.prompt.createMany({
      data: [
        {
          userId: seedUser.id,
          categoryId: cat1.id,
          subCategoryId: subJs.id,
          userPrompt: 'Explain what a closure is and give a short example.',
          generatedLesson:
            '**Closures**\n\nA closure is when a function "remembers" the variables from the scope where it was created, even after that scope has finished.\n\n**Example:**\n```js\nfunction makeCounter() {\n  let count = 0;\n  return function () {\n    count++;\n    return count;\n  };\n}\nconst counter = makeCounter();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2\n```\nThe inner function closes over `count` — that is the closure.',
        },
        {
          userId: seedUser.id,
          categoryId: cat1.id,
          subCategoryId: subTs.id,
          userPrompt: 'What is the difference between type and interface in TypeScript?',
          generatedLesson:
            '**type vs interface**\n\n- **interface**: Best for object shapes. Can be extended and merged (declaration merging).\n- **type**: Can represent primitives, unions, tuples, and mapped types; no declaration merging.\n\n**When to use which:** Use `interface` for object contracts; use `type` for unions, intersections, and more complex types.',
        },
        {
          userId: admin.id,
          categoryId: cat1.id,
          subCategoryId: subJs.id,
          userPrompt: 'How do I use async/await with fetch?',
          generatedLesson:
            "**async/await with fetch**\n\n1. Mark the function as `async`.\n2. `await` the promise returned by `fetch()`.\n3. Parse the body (e.g. `.json()`).\n\n**Example:**\n```js\nasync function getData() {\n  const res = await fetch('https://api.example.com/data');\n  const data = await res.json();\n  return data;\n}\n```\nAlways handle errors with try/catch or `.catch()`.",
        },
        {
          userId: seedUser.id,
          categoryId: cat2.id,
          subCategoryId: subAlgebra.id,
          userPrompt: 'Explain how to solve a linear equation like 2x + 3 = 11.',
          generatedLesson:
            '**Solving 2x + 3 = 11**\n\n1. Isolate the term with x: subtract 3 from both sides.\n   - 2x + 3 - 3 = 11 - 3  →  2x = 8\n2. Solve for x: divide both sides by 2.\n   - x = 8 / 2  →  x = 4\n3. Check: 2(4) + 3 = 8 + 3 = 11 ✓\n\n**Rule:** Do the same operation on both sides to keep the equation balanced.',
        },
        {
          userId: seedUser.id,
          categoryId: cat2.id,
          subCategoryId: subAlgebra.id,
          userPrompt: 'What is the quadratic formula and when do we use it?',
          generatedLesson:
            '**Quadratic formula**\n\nFor ax² + bx + c = 0:\n\nx = (-b ± √(b² - 4ac)) / 2a\n\nThe part under the square root, b² - 4ac, is the **discriminant**.\n- If it is positive: two real solutions.\n- If zero: one repeated solution.\n- If negative: no real solutions (complex solutions exist).\n\nUse this when factoring is difficult or when you need exact solutions.',
        },
      ],
    });
    console.log('Seed prompts (history) created.');
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
