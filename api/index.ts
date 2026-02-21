export default async function handler(req: any, res: any) {
  // @ts-ignore
  const { createExpressApp } = await import("../server-dist/index.js");
  const { app } = await createExpressApp();
  return app(req, res);
}
