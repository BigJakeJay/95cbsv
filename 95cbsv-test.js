// 95cbsv 映盒 JS 环境诊断脚本
// 此版本不调用 createCheerio、$fetch 或网站接口，用于单独验证 JS 方法注册与分类返回。
async function getWebsiteInfo() {
  return {
    name: "95cbsv 测试",
    description: "JS 分类接口诊断",
    icon: "https://www.95cbsv.com/favicon.ico",
    homepage: "https://www.95cbsv.com/home.htm"
  };
}

async function getCategories() {
  return [
    { id: "26", name: "无码素人" },
    { id: "84", name: "日本无码" },
    { id: "22", name: "无码破解" }
  ];
}
