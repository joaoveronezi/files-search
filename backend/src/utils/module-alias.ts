// import "module-alias/register";
import moduleAlias from "module-alias";
import { join, resolve } from "path";

const root = resolve(__dirname, "..");

moduleAlias.addAliases({
  "@src": join(root, ""),
});
