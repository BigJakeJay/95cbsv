// 95cbsv 原生 JS 订阅适配器（NowShowTime / 映盒规范）
// 不使用 drpy2、XBPQ、JAR 或服务端插件。

const SITE = "https://www.95cbsv.com";
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const cheerio = createCheerio();

const BASE_HEADERS = {
  "User-Agent": UA,
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Referer": SITE + "/",
  "Origin": SITE
};

const CATEGORY_DATA = [
  ["26", "无码素人"], ["84", "日本无码"], ["22", "无码破解"],
  ["25", "日韩中字"], ["19", "欧美劲爆"], ["28", "经典三级"],
  ["20", "3D动漫"], ["1", "自拍国产"], ["4", "家庭乱伦"],
  ["3", "少女萝莉"], ["5", "熟女少妇"], ["7", "酒店探花"],
  ["8", "偷拍盗摄"], ["37", "醉酒迷奸"], ["90", "综合强片"],
  ["38", "吃瓜黑料"], ["2", "直播裸聊"], ["76", "巨乳诱惑"],
  ["36", "户外野战"], ["23", "AI换脸"], ["73", "群P换妻"],
  ["57", "网黄博主"], ["56", "黑人媚黑"]
];

let playerConfigCache = null;
let playerConfigPromise = null;

function absoluteUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith("//")) return "https:" + raw;
  if (raw.startsWith("/")) return SITE + raw;
  return SITE + "/" + raw.replace(/^\.?\//, "");
}

function decodeText(value) {
  let text = String(value || "").trim();
  text = text.replace(/\\(['"\\])/g, "$1").replace(/\+/g, "%20");
  try { return decodeURIComponent(text); } catch (_) { return text; }
}

async function fetchText(url, referer) {
  const options = {
    headers: Object.assign({}, BASE_HEADERS, referer ? { "Referer": referer } : {}),
    userAgent: UA
  };
  const response = await $fetch.get(url, options);
  if (typeof response === "string") return response;
  if (response && typeof response.data === "string") return response.data;
  if (response && typeof response.body === "string") return response.body;
  return "";
}

function attr($, node, selector, names) {
  const target = $(node).find(selector).first();
  for (const name of names) {
    const value = target.attr(name);
    if (value) return value;
  }
  return "";
}

function extractCards(html) {
  const $ = cheerio.load(html || "");
  const cards = $(".video-listing");
  const result = [];
  const seen = new Set();

  cards.each((_, element) => {
    const card = $(element);
    let href = card.find("a[href*='/htm/play']").first().attr("href") || "";
    if (!href) {
      const raw = card.html() || "";
      const match = raw.match(/href\s*=\s*["']([^"']*\/htm\/play\d+\/[^"'#?]+\.htm(?:\?[^"']*)?)["']/i);
      if (match) href = match[1];
    }
    const detailUrl = absoluteUrl(href);
    if (!detailUrl || seen.has(detailUrl)) return;
    seen.add(detailUrl);

    let title = "";
    const titleNode = card.find("h4.av_data_title").first();
    const titleHtml = titleNode.html() || "";
    const encoded = titleHtml.match(/decodeURIComponent\s*\(\s*(['"])([\s\S]*?)\1\s*\)/i);
    if (encoded) title = decodeText(encoded[2]);
    if (!title) title = (titleNode.text() || card.find("a[title]").first().attr("title") || "").trim();

    let cover = attr($, element, "img", ["data-src", "data-original", "src"]);
    if (!cover) cover = attr($, element, "[data-original]", ["data-original"]);
    const description = (
      card.find(".ico-time").first().text() ||
      card.find(".video-date").first().text() ||
      card.find(".video-time").first().text() ||
      ""
    ).trim();

    result.push({
      id: detailUrl,
      title: title || "未识别标题",
      cover: absoluteUrl(cover),
      url: detailUrl,
      description,
      createTime: Date.now()
    });
  });

  return result;
}

function firstText($, selectors) {
  for (const selector of selectors) {
    const value = $(selector).first().text().trim();
    if (value) return value;
  }
  return "";
}

function firstAttr($, selectors, name) {
  for (const selector of selectors) {
    const value = $(selector).first().attr(name);
    if (value) return value;
  }
  return "";
}

function extractQuotedCall(html, functionName) {
  const pattern = new RegExp(functionName + "\\s*\\(\\s*(['\"])(.*?)\\1", "is");
  const match = String(html || "").match(pattern);
  return match ? match[2] : "";
}

function extractSetM3u8(html) {
  const pattern = /setm3u8\s*\(\s*(['"])(.*?)\1\s*,\s*(['"])(.*?)\3/is;
  const match = String(html || "").match(pattern);
  return match ? { av1: match[2], h264: match[4] } : { av1: "", h264: "" };
}

function readQuotedVariable(source, variableName, fallback) {
  const pattern = new RegExp("(?:var\\s+|let\\s+|const\\s+)?" + variableName + "\\s*=\\s*(['\"])(.*?)\\1", "i");
  const match = String(source || "").match(pattern);
  return match && match[2] ? match[2] : fallback;
}

function joinPath(base, path, suffix) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const root = String(base || "").replace(/\/+$/, "") + "/";
  return root + String(path).replace(/^\/+/, "") + (suffix || "");
}

async function getPlayerConfig() {
  if (playerConfigCache) return playerConfigCache;
  if (playerConfigPromise) return playerConfigPromise;

  playerConfigPromise = (async () => {
    let source = "";
    try {
      source = await fetchText(SITE + "/js/config.js", SITE + "/");
    } catch (error) {
      console.log("95cbsv config.js 请求失败: " + String(error));
    }

    const config = {
      m3u8path1: readQuotedVariable(source, "m3u8path1", "https://h1.qhkjapp.com/data/"),
      m3u8path2: readQuotedVariable(source, "m3u8path2", "https://h3.xinghun1.com/data/"),
      av1m3u8path1: readQuotedVariable(source, "av1m3u8path1", "https://hav.owukm.com/data/"),
      av1m3u8path2: readQuotedVariable(source, "av1m3u8path2", "https://hav.owukm.com/data/"),
      downpath: readQuotedVariable(source, "downpath", "https://down.mm7878.com/data/")
    };
    playerConfigCache = config;
    return config;
  })();

  try {
    return await playerConfigPromise;
  } finally {
    playerConfigPromise = null;
  }
}

async function getWebsiteInfo() {
  return {
    name: "95cbsv",
    description: "95cbsv 视频站点",
    icon: SITE + "/favicon.ico",
    homepage: SITE + "/home.htm"
  };
}

async function getCategories() {
  return CATEGORY_DATA.map(([id, name]) => ({
    id,
    name,
    ext: { url: SITE + "/htms/list" + id + "/{page}.htm" }
  }));
}

async function getVideoList(page) {
  const html = await fetchText(SITE + "/home.htm", SITE + "/");
  return extractCards(html);
}

async function getVideosByCategory(categoryId, page, sort) {
  const id = String(categoryId || "");
  if (!CATEGORY_DATA.some(item => item[0] === id)) return [];
  const currentPage = Math.max(1, Number(page) || 1);
  const url = SITE + "/htms/list" + id + "/" + currentPage + ".htm";
  const html = await fetchText(url, SITE + "/");
  return extractCards(html);
}

async function search(keyword, page) {
  const query = String(keyword || "").trim();
  if (!query) return [];
  const url = SITE + "/list.jsp?s=" + encodeURIComponent(query);
  const html = await fetchText(url, SITE + "/");
  return extractCards(html);
}

async function getVideoDetail(videoId, url) {
  const detailUrl = absoluteUrl(url || videoId);
  if (!detailUrl) throw new Error("缺少视频详情页 URL");

  const html = await fetchText(detailUrl, SITE + "/");
  const $ = cheerio.load(html || "");
  const title = firstText($, ["h1", ".video-title", ".av_data_title", "title"]) ||
    firstAttr($, ["meta[property='og:title']"], "content") || "95cbsv 视频";
  const cover = firstAttr($, ["meta[property='og:image']", "meta[name='og:image']"], "content") ||
    firstAttr($, [".video-poster img", ".video-cover img", "img"], "src");
  const description = firstText($, [".video-description", ".video-info", ".video-content"]) ||
    firstAttr($, ["meta[name='description']", "meta[property='og:description']"], "content");

  const paths = extractSetM3u8(html);
  const mp4Path = extractQuotedCall(html, "showline");
  const config = await getPlayerConfig();
  const resolutions = [];

  const h264Normal = joinPath(config.m3u8path1, paths.h264, "index.m3u8");
  const h264Fast = joinPath(config.m3u8path2, paths.h264, "index.m3u8");
  const av1Normal = joinPath(config.av1m3u8path1, paths.av1, "index.m3u8");
  const av1Fast = joinPath(config.av1m3u8path2, paths.av1, "index.m3u8");
  const mp4 = joinPath(config.downpath, mp4Path, "");

  if (h264Normal) resolutions.push({ id: "h264-normal", name: "H.264 普通", url: h264Normal, size: "未知" });
  if (h264Fast && h264Fast !== h264Normal) resolutions.push({ id: "h264-fast", name: "H.264 极速", url: h264Fast, size: "未知" });
  if (av1Normal) resolutions.push({ id: "av1-normal", name: "AV1", url: av1Normal, size: "未知" });
  if (av1Fast && av1Fast !== av1Normal) resolutions.push({ id: "av1-fast", name: "AV1 备用", url: av1Fast, size: "未知" });
  if (mp4) resolutions.push({ id: "mp4", name: "MP4", url: mp4, size: "未知" });

  return {
    id: String(videoId || detailUrl),
    title,
    cover: absoluteUrl(cover),
    description,
    resolutions
  };
}

async function getPlayUrl(episodeUrl) {
  return String(episodeUrl || "");
}
