exports.id=8982,exports.ids=[8982],exports.modules={35552:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.d(b,{db:()=>m,tx:()=>n});var e=c(28855),f=c(73024),g=c.n(f),h=c(76760),i=c.n(h),j=a([e]);e=(j.then?(await j)():j)[0];let p=process.env.DATABASE_PATH||i().join(process.cwd(),"data","store.db"),q=process.env.TURSO_DATABASE_URL||`file:${p}`,r=`
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, alias TEXT NOT NULL UNIQUE,
  meta_title TEXT, meta_description TEXT, status INTEGER NOT NULL DEFAULT 1, order_no INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS sub_categories (
  id INTEGER PRIMARY KEY, category_id INTEGER NOT NULL REFERENCES categories(id),
  name TEXT NOT NULL, alias TEXT NOT NULL UNIQUE, description TEXT, img TEXT,
  meta_title TEXT, meta_description TEXT,
  status INTEGER NOT NULL DEFAULT 1,      -- 1 = shown in navigation
  featured INTEGER NOT NULL DEFAULT 0,    -- 1 = shown on the homepage
  order_no INTEGER NOT NULL DEFAULT 0, home_order_no INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY, sub_category_id INTEGER NOT NULL REFERENCES sub_categories(id),
  alias TEXT NOT NULL UNIQUE, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL, sale_price INTEGER,          -- whole rupees
  img TEXT, code TEXT,
  in_stock INTEGER NOT NULL DEFAULT 1,
  stock INTEGER,                                      -- NULL = quantity not tracked
  on_sale INTEGER NOT NULL DEFAULT 0, youtube_link TEXT,
  hidden INTEGER NOT NULL DEFAULT 0,
  meta_title TEXT, meta_description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS products_sub ON products(sub_category_id);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY, number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT, city TEXT NOT NULL, address TEXT NOT NULL, remarks TEXT,
  payment_method TEXT NOT NULL, subtotal INTEGER NOT NULL, discount INTEGER NOT NULL DEFAULT 0,
  discount_code TEXT, shipping INTEGER NOT NULL, total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', admin_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER, title TEXT NOT NULL, code TEXT, img TEXT,
  unit_price INTEGER NOT NULL, qty INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS discounts (
  id INTEGER PRIMARY KEY, code TEXT NOT NULL UNIQUE COLLATE NOCASE,
  type TEXT NOT NULL CHECK (type IN ('percent','fixed')), value INTEGER NOT NULL,
  min_subtotal INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, expires_at TEXT,
  used_count INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS pages (
  slug TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
  meta_description TEXT, updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sub_categories_cat ON sub_categories(category_id);
CREATE INDEX IF NOT EXISTS order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS orders_phone ON orders(phone);
`,s=a=>a.rows.map(b=>Object.fromEntries(a.columns.map((a,c)=>[a,b[c]])));function k(a,b){let c=async c=>(await a()).execute({sql:b,args:c});return{all:async(...a)=>s(await c(a)),get:async(...a)=>s(await c(a))[0],run:async(...a)=>{let b=await c(a);return{lastInsertRowid:Number(b.lastInsertRowid??0),changes:b.rowsAffected}}}}let t=globalThis;async function l(){process.env.TURSO_DATABASE_URL||g().mkdirSync(i().dirname(p),{recursive:!0});let a=(0,e.createClient)({url:q,authToken:process.env.TURSO_AUTH_TOKEN});return await a.executeMultiple(r),Number((await a.execute("SELECT COUNT(*) n FROM categories")).rows[0].n)||await o(a),a}let u=()=>t.__db??=l().catch(a=>{throw t.__db=void 0,a});function m(){return{prepare:a=>k(u,a)}}async function n(a){let b=await (await u()).transaction("write");try{let c=await a({prepare:a=>k(async()=>b,a)});return await b.commit(),c}catch(a){throw await b.rollback().catch(()=>{}),a}finally{b.close()}}let v=i().join(process.cwd(),"data","reference"),w=a=>JSON.parse(g().readFileSync(i().join(v,a),"utf8"));async function o(a){if(!g().existsSync(i().join(v,"get_navigation.json")))return;let b=w("get_navigation.json").nave,c=w("settings.json").data,d=[],e=a=>({run:(...b)=>{d.push({sql:a,args:b})}}),f=e("INSERT INTO categories (id,name,alias,meta_title,meta_description,status,order_no) VALUES (?,?,?,?,?,?,?)"),h=e(`INSERT INTO sub_categories (id,category_id,name,alias,description,img,meta_title,meta_description,status,featured,order_no,home_order_no)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`),j=e(`INSERT INTO products (id,sub_category_id,alias,title,description,price,sale_price,img,code,in_stock,on_sale,youtube_link,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`),k=e("INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)");{for(let a of b){for(let b of(f.run(a.cat_id,a.cat_name,a.alias,a.meta_title,a.meta_description,a.status??1,a.order_no??0),a.sub_cat))h.run(b.sub_cat_id,a.cat_id,b.sub_cat,b.alias,b.des,b.img,b.meta_title,b.meta_description,b.status??0,b.featured??0,b.order_no??0,b.home_order_no??0);let b=i().join(v,`${a.alias}.json`);if(g().existsSync(b))for(let a of JSON.parse(g().readFileSync(b,"utf8")).cat_products)for(let b of a.prod){let c=Number(b.p_price),d=b.p_sale?Number(b.p_sale):null;j.run(b.p_id,a.sub_cat_id,b.alias,b.p_title,b.p_des??"",c,d&&d<c?d:null,b.p_img,b.p_code,+(3!==b.status),+!!b.on_sale_page,b.youtube_link,b.created_at,b.updated_at??b.created_at)}}let a={store_name:"Khaddar Virsa",top_bar_text:["Cash on Delivery across Pakistan",`Free delivery on orders over Rs ${Number(c.shipping_fee_over).toLocaleString()}`],sale_title:c.today_sale_title,sale_color:"#"+c.today_sale_color,shipping_charges:c.shipping_charges,free_shipping_over:c.shipping_fee_over,contact:{address:[],email:["info@khaddervirsa.com"],phone:["+92 342 4307737"]},whatsapp_number:"923424307737",social:[],bank_details:[],bank_note:"",sliders:[],seo_title:"Khaddar Virsa \xb7 Premium Men's Khaddar Suits",seo_description:"Khaddar Virsa: premium Kamalia khaddar suit fabric for men. Cash on Delivery across Pakistan."};for(let[b,c]of Object.entries(a))k.run(b,JSON.stringify(c));let d=e("INSERT INTO pages (slug,title,body) VALUES (?,?,?)");for(let[a,b]of[["about-us","About Us"],["faq","FAQ"],["return-policy","Return Policy"],["terms","Terms & Conditions"],["privacy-policy","Privacy Policy"],["locations","Our Outlets"]])d.run(a,b,"")}await a.batch(d,"write")}d()}catch(a){d(a)}})},39582:(a,b,c)=>{"use strict";Object.defineProperty(b,"__esModule",{value:!0}),!function(a,b){for(var c in b)Object.defineProperty(a,c,{enumerable:!0,get:b[c]})}(b,{resolveManifest:function(){return g},resolveRobots:function(){return e},resolveRouteData:function(){return h},resolveSitemap:function(){return f}});let d=c(60096);function e(a){let b="";for(let c of Array.isArray(a.rules)?a.rules:[a.rules]){for(let a of(0,d.resolveArray)(c.userAgent||["*"]))b+=`User-Agent: ${a}
`;if(c.allow)for(let a of(0,d.resolveArray)(c.allow))b+=`Allow: ${a}
`;if(c.disallow)for(let a of(0,d.resolveArray)(c.disallow))b+=`Disallow: ${a}
`;c.crawlDelay&&(b+=`Crawl-delay: ${c.crawlDelay}
`),b+="\n"}return a.host&&(b+=`Host: ${a.host}
`),a.sitemap&&(0,d.resolveArray)(a.sitemap).forEach(a=>{b+=`Sitemap: ${a}
`}),b}function f(a){let b=a.some(a=>Object.keys(a.alternates??{}).length>0),c=a.some(a=>{var b;return!!(null==(b=a.images)?void 0:b.length)}),d=a.some(a=>{var b;return!!(null==(b=a.videos)?void 0:b.length)}),e="";for(let i of(e+='<?xml version="1.0" encoding="UTF-8"?>\n',e+='<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',c&&(e+=' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'),d&&(e+=' xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"'),b?e+=' xmlns:xhtml="http://www.w3.org/1999/xhtml">\n':e+=">\n",a)){var f,g,h;e+="<url>\n",e+=`<loc>${i.url}</loc>
`;let a=null==(f=i.alternates)?void 0:f.languages;if(a&&Object.keys(a).length)for(let b in a)e+=`<xhtml:link rel="alternate" hreflang="${b}" href="${a[b]}" />
`;if(null==(g=i.images)?void 0:g.length)for(let a of i.images)e+=`<image:image>
<image:loc>${a}</image:loc>
</image:image>
`;if(null==(h=i.videos)?void 0:h.length)for(let a of i.videos)e+=["<video:video>",`<video:title>${a.title}</video:title>`,`<video:thumbnail_loc>${a.thumbnail_loc}</video:thumbnail_loc>`,`<video:description>${a.description}</video:description>`,a.content_loc&&`<video:content_loc>${a.content_loc}</video:content_loc>`,a.player_loc&&`<video:player_loc>${a.player_loc}</video:player_loc>`,a.duration&&`<video:duration>${a.duration}</video:duration>`,a.view_count&&`<video:view_count>${a.view_count}</video:view_count>`,a.tag&&`<video:tag>${a.tag}</video:tag>`,a.rating&&`<video:rating>${a.rating}</video:rating>`,a.expiration_date&&`<video:expiration_date>${a.expiration_date}</video:expiration_date>`,a.publication_date&&`<video:publication_date>${a.publication_date}</video:publication_date>`,a.family_friendly&&`<video:family_friendly>${a.family_friendly}</video:family_friendly>`,a.requires_subscription&&`<video:requires_subscription>${a.requires_subscription}</video:requires_subscription>`,a.live&&`<video:live>${a.live}</video:live>`,a.restriction&&`<video:restriction relationship="${a.restriction.relationship}">${a.restriction.content}</video:restriction>`,a.platform&&`<video:platform relationship="${a.platform.relationship}">${a.platform.content}</video:platform>`,a.uploader&&`<video:uploader${a.uploader.info&&` info="${a.uploader.info}"`}>${a.uploader.content}</video:uploader>`,`</video:video>
`].filter(Boolean).join("\n");if(i.lastModified){let a=i.lastModified instanceof Date?i.lastModified.toISOString():i.lastModified;e+=`<lastmod>${a}</lastmod>
`}i.changeFrequency&&(e+=`<changefreq>${i.changeFrequency}</changefreq>
`),"number"==typeof i.priority&&(e+=`<priority>${i.priority}</priority>
`),e+="</url>\n"}return e+"</urlset>\n"}function g(a){return JSON.stringify(a)}function h(a,b){return"robots"===b?e(a):"sitemap"===b?f(a):"manifest"===b?g(a):""}},60096:(a,b)=>{"use strict";function c(a){return Array.isArray(a)?a:[a]}function d(a){if(null!=a)return c(a)}function e(a){let b;if("string"==typeof a)try{b=(a=new URL(a)).origin}catch{}return b}Object.defineProperty(b,"__esModule",{value:!0}),!function(a,b){for(var c in b)Object.defineProperty(a,c,{enumerable:!0,get:b[c]})}(b,{getOrigin:function(){return e},resolveArray:function(){return c},resolveAsArrayOrUndefined:function(){return d}})},74823:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.d(b,{DZ:()=>h,dv:()=>l,hX:()=>i,mt:()=>k});var e=c(74515),f=c(35552),g=a([f]);f=(g.then?(await g)():g)[0];let j={store_name:"Khaddar Virsa",top_bar_text:[],sale_title:"Sale",sale_color:"#B70000",sale_enabled:!0,sale_headline:"",sale_text:"",sale_banner:"",sale_ends_at:"",menu_pages:[],shipping_charges:0,free_shipping_over:0,contact:{address:[],email:[],phone:[]},whatsapp_number:"",social:[],bank_details:[],bank_note:"",sliders:[],seo_title:"Khaddar Virsa",seo_description:""},k=(0,e.cache)(async()=>{let a=await (0,f.db)().prepare("SELECT key, value FROM settings").all(),b={...j};for(let c of a)b[c.key]=JSON.parse(c.value);return b});async function h(a){await (0,f.tx)(async b=>{let c=b.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");for(let[b,d]of Object.entries(a))b in j&&await c.run(b,JSON.stringify(d))})}let l=a=>`https://wa.me/${a.replace(/\D/g,"").replace(/^0/,"92")}`;function i(){let a=process.env.VERCEL_PROJECT_PRODUCTION_URL;return(process.env.SITE_URL||(a?`https://${a}`:"http://localhost:3000")).replace(/\/$/,"")}d()}catch(a){d(a)}})},78335:()=>{},96487:()=>{}};