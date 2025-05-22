import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import AutoImport from "unplugin-auto-import/vite";
import VueRouter from "unplugin-vue-router/vite";
import { VueRouterAutoImports } from "unplugin-vue-router";
import Layouts from "vite-plugin-vue-layouts";
import mkcert from 'vite-plugin-mkcert';

// https://vite.dev/config/
export default defineConfig({
    appType: "spa",
    server: {
        https: {
            cert: 'E:\\mkcert\\vite\\localhost+1.pem',
            key: 'E:\\mkcert\\vite\\localhost+1-key.pem',
        }
    },
    plugins: [
        mkcert(),
        VueRouter({
            routesFolder: [
                {
                    src: "src/pages",
                    path: "",
                    // override globals
                    exclude: (excluded) => excluded,
                    filePatterns: (filePatterns) => filePatterns,
                    extensions: (extensions) => extensions,
                },
            ],
            // what files should be considered as a pages
            extensions: [".vue"],

            // what files to include
            filePatterns: ["**/*"], // files to exclude from the scan
            exclude: [],

            // where to generate the types
            dts: "src/types/typed-router.d.ts",

            // how to generate the route name
            // getRouteName: (routeNode) => getFileBasedRouteName(routeNode),

            // default language for <route> custom blocks
            routeBlockLang: "json5",

            // how to import routes, can also be a string
            importMode: "async",

            // where are paths relative to
            root: process.cwd(),

            // options for the path parser
            // pathParser: {
            //   // should `users.[id]` be parsed as `users/:id`?
            //   dotNesting: true,
            // },

            // modify routes individually
            // extendRoute(route) {
            // },

            // modify routes before writing
            // async beforeWriteFiles(rootRoute) {
            // },
        }),
        vue(), // Vue must be placed after VueRouter()
        Layouts({
            layoutsDirs: "src/layouts", // 指定布局文件的目录路径
            defaultLayout: "default", // 指定默认布局文件的名称
        }) as never,
        AutoImport({
            imports: [
                "vue",
                // "vue-router",
                "@vueuse/core",
                "pinia",
                "vue-i18n",
                VueRouterAutoImports,
            ],
            dts: "src/types/auto-imports.d.ts",
            dirs: ["src/utils", "src/components", "src/composables", "src/stores"],
        }),
        vueDevTools(),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
