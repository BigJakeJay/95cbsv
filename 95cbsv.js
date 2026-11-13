// 95cbsv 本机 drpy2 规则
// 仅使用客户端 drpy2 JS 运行时；不依赖 XBPQ、JAR 或服务端插件。

function _95abs(u) {
  if (!u) return "";
  u = String(u).trim();
  if (/^https?:\/\//i.test(u)) return u;
  return "https://www.95cbsv.com/" + u.replace(/^\/+/, "");
}
function _95decode(s) {
  if (!s) return "";
  s = String(s).replace(/\\(['"\\])/g, "$1").replace(/\+/g, "%20");
  try { return decodeURIComponent(s); } catch (e) { return s; }
}
function _95title(card) {
  var m = String(card).match(/decodeURIComponent\s*\(\s*(['"])((?:\\.|(?!\1)[\s\S])*)\1/);
  if (m) return _95decode(m[2]);
  try { return String(jsp.pdfh(card, "h4.av_data_title&&Text") || "").trim(); }
  catch (e) { return ""; }
}
function _95cards(pageHtml) {
  var cards = jsp.pdfa(pageHtml, ".video-listing") || [];
  var out = [];
  cards.forEach(function(card) {
    var raw = String(card), href = "";
    var hm = raw.match(/href\s*=\s*["']([^"']*\/htm\/play\d+\/[^"'#?]+\.htm(?:\?[^"']*)?)["']/i);
    if (hm) href = hm[1];
    if (!href) {
      try { href = jsp.pdfh(card, "a[href*='/htm/play']&&href") || ""; } catch (e) {}
    }
    if (!href) return;
    var name = _95title(raw), pic = "", remark = "";
    if (!name) {
      try { name = jsp.pdfh(card, "h4.av_data_title&&Text") || ""; } catch (e) {}
    }
    try {
      pic = jsp.pdfh(card, "img&&data-src") || jsp.pdfh(card, "img&&data-original") || jsp.pdfh(card, "img&&src") || "";
      remark = jsp.pdfh(card, ".ico-time&&Text") || jsp.pdfh(card, ".video-date&&Text") || "";
    } catch (e) {}
    out.push({title:String(name || "未识别标题").trim(),img:_95abs(pic),desc:String(remark || "").trim(),url:_95abs(href)});
  });
  return out;
}
function _95arg(pageHtml, index) {
  var m = String(pageHtml).match(/setm3u8\s*\(\s*(['"])((?:\\.|(?!\1)[\s\S])*?)\1\s*,\s*(['"])((?:\\.|(?!\3)[\s\S])*?)\3/i);
  if (!m) return "";
  return index === 0 ? m[2] : m[4];
}
function _95callArg(pageHtml, fn) {
  var re = new RegExp(fn + "\\s*\\(\\s*(['\"])((?:\\\\.|(?!\\1)[\\s\\S])*?)\\1", "i");
  var m = String(pageHtml).match(re);
  return m ? m[2] : "";
}
function _95configValue(config, name, fallback) {
  var re = new RegExp("(?:var\\s+)?" + name + "\\s*=\\s*(['\"])(.*?)\\1", "i");
  var m = String(config).match(re);
  return m ? m[2] : fallback;
}
function _95join(base, path, suffix) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return String(base || "").replace(/\/?$/, "/") + String(path).replace(/^\/+/, "") + (suffix || "");
}

var rule = {
  title: "95cbsv",
  host: "https://www.95cbsv.com",
  homeUrl: "/home.htm",
  url: "/htms/listfyclass/fypage.htm",
  searchUrl: "/list.jsp?s=**",
  searchable: 2,
  quickSearch: 0,
  filterable: 0,
  class_name: "无码素人&日本无码&无码破解&日韩中字&欧美劲爆&经典三级&3D动漫&自拍国产&家庭乱伦&少女萝莉&熟女少妇&酒店探花&偷拍盗摄&醉酒迷奸&综合强片&吃瓜黑料&直播裸聊&巨乳诱惑&户外野战&AI换脸&群P换妻&网黄博主&黑人媚黑",
  class_url: "26&84&22&25&19&28&20&1&4&3&5&7&8&37&90&38&2&76&36&23&73&57&56",
  headers: {
    "User-Agent": "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
    "Referer": "https://www.95cbsv.com/"
  },
  limit: 20,
  play_parse: false,
  double: false,
  推荐: "js:var h=request(HOST+'/home.htm'); VODS=setResult(_95cards(h));",
  一级: "js:var h=request(input); VODS=setResult(_95cards(h));",
  搜索: "js:var h=request(input); VODS=setResult(_95cards(h));",
  二级: {
    title: "h1&&Text;title&&Text",
    img: "meta[property='og:image']&&content;img&&src",
    desc: ".video-info&&Text;.video-date&&Text",
    content: ".video-description&&Text;.video-info&&Text",
    tabs: "js:TABS=['H.264 普通','H.264 极速','AV1','MP4']",
    lists: "js:var avPath=_95arg(html,0); var h264Path=_95arg(html,1); var mp4Path=_95callArg(html,'showline'); var cfg=''; try{cfg=request(HOST+'/js/config.js');}catch(e){}; var h1=_95configValue(cfg,'m3u8path1','https://h1.qhkjapp.com/data/'); var h2=_95configValue(cfg,'m3u8path2','https://h3.xinghun1.com/data/'); var av1=_95configValue(cfg,'av1m3u8path1','https://hav.owukm.com/data/'); var down=_95configValue(cfg,'downpath','https://down.mm7878.com/data/'); var u1=_95join(h1,h264Path,'index.m3u8'); var u2=_95join(h2,h264Path,'index.m3u8'); var ua=_95join(av1,avPath,'index.m3u8'); var ud=_95join(down,mp4Path,''); var l1=[],l2=[],l3=[],l4=[]; if(u1)l1.push('普通线路$'+u1); if(u2)l2.push('极速线路$'+u2); if(ua)l3.push('AV1$'+ua); if(ud)l4.push('MP4下载$'+ud); LISTS=[l1,l2,l3,l4];"
  }
};
