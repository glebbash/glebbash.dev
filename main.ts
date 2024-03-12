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
      root: `./static`,
      index: "index.html",
    });
  } catch {
    ctx.response.status = 404;
    ctx.response.body = "404 File not found";
  }
});

await app.listen({ port: 8000 });
