const fs = require("node:fs");
const path = require("node:path");

function interopDefault(mod) {
  return mod && typeof mod === "object" && "default" in mod ? mod.default : mod;
}

function asPostcssPlugin(plugin, options) {
  const resolved = interopDefault(plugin);
  if (!resolved) throw new Error("Missing PostCSS plugin");
  if (resolved.postcssPlugin) return resolved;
  if (typeof resolved === "function") return resolved(options ?? {});
  return resolved;
}

async function buildOnce({ inputPath, outputPath }) {
  const postcss = interopDefault(require("postcss"));
  const tailwind = require("@tailwindcss/postcss");
  const autoprefixer = require("autoprefixer");

  const inputCss = fs.readFileSync(inputPath, "utf8");
  const result = await postcss([
    asPostcssPlugin(tailwind),
    asPostcssPlugin(autoprefixer),
  ]).process(inputCss, {
    from: inputPath,
    to: outputPath,
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result.css);
}

function shouldRebuild(filename) {
  if (!filename) return false;
  const normalized = filename.replaceAll("\\", "/");
  if (normalized.endsWith(".css")) return true;
  if (normalized.endsWith(".html")) return true;
  if (normalized.endsWith(".js")) return true;
  if (normalized.endsWith("tailwind.config.js")) return true;
  if (normalized.endsWith("postcss.config.js")) return true;
  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const watch = args.includes("--watch");

  const inputPath = path.join(process.cwd(), "assets/css/style.css");
  const outputPath = path.join(process.cwd(), "assets/css/style.compiled.css");

  await buildOnce({ inputPath, outputPath });
  process.stdout.write(`Built ${path.relative(process.cwd(), outputPath)}\n`);

  if (!watch) return;

  process.stdout.write("Watching for changes...\n");

  let timer = null;
  fs.watch(process.cwd(), { recursive: true }, (eventType, filename) => {
    if (!shouldRebuild(filename)) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await buildOnce({ inputPath, outputPath });
        process.stdout.write(
          `Rebuilt (${eventType}) ${path.relative(process.cwd(), outputPath)}\n`,
        );
      } catch (err) {
        process.stderr.write(`${err.stack || err}\n`);
      }
    }, 100);
  });
}

main().catch((err) => {
  process.stderr.write(`${err.stack || err}\n`);
  process.exit(1);
});
