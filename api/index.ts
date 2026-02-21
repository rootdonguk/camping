// @ts-ignore
import { createExpressApp } from "../server-dist/index.js";

export default async function handler(req: any, res: any) {
  const { app } = await createExpressApp();
  return app(req, res);
}
