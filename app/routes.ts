import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("api/fact-check", "routes/api.fact-check.ts"),
  route("api/upload-image", "routes/api.upload-image.ts"),
] satisfies RouteConfig;
