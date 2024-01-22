module.exports = {
  "env": {
    "node": true,
  },
  "extends": [
    "eslint:recommended",
    "plugin:vue/essential",
    "plugin:@typescript-eslint/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 12,
    "parser": "@typescript-eslint/parser",
    "sourceType": "module"
  },
  "plugins": [
    "vue",
    "@typescript-eslint"
  ],
  "rules": {
    "indent": [2, 2], // 强制使用一致的缩进
    "eqeqeq": [2, "always"], //必须使用全等    要求使用 === 和 !==
    "semi": [2, "never"], // 要求或禁止使用分号代替 ASI,即禁用行尾使用分号
    "quotes": [2, "double"],  // 强制使用一致的反勾号、双引号或单引号
    "no-extra-semi": [2], // 禁止不必要的分号
    // "comma-dangle": [2, "never"], // 禁止末尾逗号
    "no-extra-parens": 2,//禁止非必要的括号
    "no-multiple-empty-lines": [1, {"max": 3}],//空行最多不能超过3行
    "no-trailing-spaces": 1,//一行结束后面不要有空格
    "no-var": 1,//警告使用var，用let和const代替
    "camelcase": 2,//强制驼峰法命名
    "strict": 2,//使用严格模式
    "no-extra-label:":0,// 禁用不必要的标签
    // "max-len":[1,88],// 强制一行的最大长度
  }
}
