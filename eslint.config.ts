import { globalIgnores } from "eslint/config";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import pluginVitest from "@vitest/eslint-plugin";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
    {
        name: "app/files-to-lint",
        files: ["**/*.{ts,mts,tsx,vue}"],
    },
    globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**", "**/wailsjs/**"]),
    pluginVue.configs["flat/recommended"],
    vueTsConfigs["recommended"],
    {
        ...pluginVitest.configs.recommended,
        files: ["src/**/__tests__/*"],
    },
    skipFormatting,
    {
        rules: {
            semi: ["error", "always"], // 强制语句末尾使用分号
            indent: [
                "error",
                4,
                {
                    baseIndent: 0, // 顶层代码缩进基数（设置为 1 时，顶层代码缩进 2 空格）
                    switchCase: 1, // case 子句缩进 1 级（2 空格）
                },
            ],
            "@typescript-eslint/no-unused-vars": "error", // 关闭未使用变量检查
            "@typescript-eslint/no-var-requires": "warn", // 允许使用 require()
            "@typescript-eslint/no-explicit-any": "error", // 允许使用 any 类型
            "@typescript-eslint/no-this-alias": "warn", // 允许 this 别名
            "@typescript-eslint/no-empty-object-type": "error",
            "no-debugger": "warn", // 允许 debugger 语句

            // ----- Vue 专用规则 -----
            // https://eslint.vuejs.org/rules/no-useless-template-attributes.html
            //  配置 Vue <script> 标签内的缩进规则
            "vue/script-indent": [
                "error",
                2,
                {
                    baseIndent: 0,
                    switchCase: 1,
                    ignores: [],
                },
            ],
            "vue/block-lang": "off",
            "vue/multi-word-component-names": "off", // 允许组件名不使用多词命名
            "vue/no-arrow-functions-in-watch": "error", // 禁止在 watch 中使用箭头函数
            "vue/no-async-in-computed-properties": "error", // 禁止在计算属性中使用 async
            "vue/no-multiple-template-root": "off", // 允许多个根节点
            "vue/no-unused-vars": "error", // 关闭 Vue 未使用变量检查
            "vue/no-template-shadow": "warn", // 允许模板变量遮蔽
            "vue/require-v-for-key": "error", // 关闭 v-for 必须带 key 的检查
            "vue/no-textarea-mustache": "warn", // 允许 textarea 使用 mustache
            "vue/no-v-html": "warn", // 允许使用 v-html（注意 XSS 风险）
            "vue/no-v-model-argument": "off", // 允许 v-model 使用自定义修饰符
            "vue/no-v-text-v-html-on-component": "off", // 允许 v-text 和 v-html 在组件上使用
            "vue/no-v-for-template-key": "off", // 允许 v-for 使用 template 标签
            "vue/first-attribute-linebreak": "off",
        },
    },
);
