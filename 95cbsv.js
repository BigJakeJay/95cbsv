// 95cbsv drpy2 本机 JS 适配规则；不依赖服务端 XBPQ/JAR 插件。
function absUrl(url){if(!url)return "";if(/^https?:\/\//i.test(url))return url;return "https://www.95cbsv.com/"+String(url).replace(/^\/+/,"");}
function decodeCardTitle(cardHtml){var h=pdfh(cardHtml,"h4.av_data_title&&Html")||"";var m=h.match(/decodeURIComponent\(\s*(['"])((?:\\.|(?!\1)[\s\S])*)\1/);if(m){var s=m[2].replace(/\\(['"\\])/g,"$1");try{return decodeURIComponent(s.replace(/\+/g,"%20"));}catch(e){}}return (pdfh(cardHtml,"h4.av_data_title&&Text")||"").trim();}
function parseCards(pageHtml){var cards=pdfa(pageHtml,".video-listing")||[];var out=[];cards.forEach(function(c){var name=decodeCardTitle(c);var href=pdfh(c,"h4.av_data_title a&&href")||pdfh(c,"a[href*='/htm/play']&&href");if(!href)return;var pic=pdfh(c,"img&&data-src")||pdfh(c,"img&&data-original")||pdfh(c,"img&&src")||"";var remark=pdfh(c,".ico-time&&Text")||pdfh(c,".video-date&&Text")||"";out.push({vod_id:absUrl(href),vod_name:name||"未识别标题",vod_pic:absUrl(pic),vod_remarks:remark});});return out;}
var rule={
title:"95cbsv",host:"https://www.95cbsv.com",homeUrl:"/home.htm",
url:"/htms/listfyclass/fypage.htm",searchUrl:"/list.jsp?s=**",
searchable:2,quickSearch:0,filterable:0,
class_name:"无码素人&日本无码&无码破解&日韩中字&欧美劲爆&经典三级&3D动漫&自拍国产&家庭乱伦&少女萝莉&熟女少妇&酒店探花&偷拍视频&醉酒迷奸&综合强片&吃瓜黑料&直播裸聊&巨乳诱惑&户外野战&AI换脸&群P换妻&网黄博主&黑人媚黑",
class_url:"26&84&22&25&19&28&20&1&4&3&5&7&8&37&90&38&2&76&36&23&73&57&56",
headers:{"User-Agent":"Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36","Referer":"https://www.95cbsv.com/"},
limit:20,play_parse:false,lazy:"",
一级:"js:var pageHtml=request(input);var items=parseCards(pageHtml);var pageNo=Number(MY_PAGE||1);var maxPage=pageNo;var links=pageHtml.match(/\\/htms\\/list\\d+\\/(\\d+)\\.htm/g)||[];links.forEach(function(x){var n=Number((x.match(/\\/(\\d+)\\.htm/)||[])[1]||0);if(n>maxPage)maxPage=n;});setResult2({page:pageNo,pagecount:maxPage,limit:items.length||20,total:maxPage*(items.length||20),list:items});",
二级:{
title:"h1&&Text;title&&Text",img:"meta[property='og:image']&&content;img&&src",
desc:".video-info&&Text;.video-date&&Text",content:".video-description&&Text;.video-info&&Text",
tabs:"js:TABS=[\"H.264 普通\",\"H.264 极速\",\"AV1\",\"MP4\"]",
lists:"js:function a2(s){var m=s.match(/setm3u8\\s*\\(\\s*(['\"])(.*?)\\1\\s*,\\s*(['\"])(.*?)\\3/i);return m?[m[2],m[4]]:[];}function ca(s,f){var r=new RegExp(f+\"\\\\s*\\\\(\\\\s*(['\\\"])(.*?)\\\\1\",\"i\");var m=s.match(r);return m?m[2]:\"\";}function rv(s,n,d){var r=new RegExp(\"(?:var\\\\s+)?\"+n+\"\\\\s*=\\\\s*(['\\\"])(.*?)\\\\1\",\"i\");var m=s.match(r);return m?m[2]:d;}function mu(b,p,s){if(!p)return \"\";if(/^https?:\\/\\//i.test(p))return p;return b.replace(/\\/?$/,\"/\")+p.replace(/^\\/+/,\"\")+(s||\"\");}var a=a2(html),hp=a[1]||\"\",ap=a[0]||\"\",mp=ca(html,\"showline\");var b1=rv(html,\"m3u8path1\",\"https://h1.qhkjapp.com/data/\"),b2=rv(html,\"m3u8path2\",\"https://h3.xinghun1.com/data/\"),ba=rv(html,\"av1m3u8path1\",\"https://hav.owukm.com/data/\"),bd=rv(html,\"downpath\",\"https://down.mm7878.com/data/\");var u1=mu(b1,hp,\"index.m3u8\"),u2=mu(b2,hp,\"index.m3u8\"),ua=mu(ba,ap,\"index.m3u8\"),ud=mu(bd,mp,\"\");LISTS=[[u1?\"普通线路$\"+u1:\"\"],[u2?\"极速线路$\"+u2:\"\"],[ua?\"AV1$\"+ua:\"\"],[ud?\"MP4$\"+ud:\"\"]];"
}};
