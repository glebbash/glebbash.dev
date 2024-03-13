import { Application } from "jsr:@oak/oak";

const app = new Application();

const baseUrls = [...Deno.readDirSync("static")]
  .filter((d) => d.isDirectory)
  .map((d) => d.name);

app.use(async (ctx) => {
  for (const baseUrl of baseUrls) {
    if (ctx.request.url.pathname === `/${baseUrl}`) {
      return ctx.response.redirect(`/${baseUrl}/`);
    }
  }
  try {
    await ctx.send({
      root: "./static",
      index: "index.html",
    });
  } catch {
    return ctx.send({ root: "static", path: "404.html" });
  }
});

await app.listen({ port: 8000 });
