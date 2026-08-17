import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * The send-to-inbox route reads its PDFs off disk at request time. Next's
   * file tracer follows static imports, not a path assembled at runtime, so
   * without this the PDFs are left out of a standalone/serverless build and
   * the route 500s in production while working perfectly in dev.
   */
  outputFileTracingIncludes: {
    "/api/send-stash-email": ["./content/stash-email-pdfs/**/*"],
  },
};

export default nextConfig;
