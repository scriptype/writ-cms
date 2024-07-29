const assert = require('assert')

class ContentTree {
  constructor() {}
}

class ContentTreeEntry {
  constructor({ name, pathway, timestamp, content, children }) {
    this.name = assert(typeof name === 'string') || name
    this.pathway = assert(pathway instanceof Array) || pathway
    this.timestamp = assert(Number.isInteger(timestamp)) || timestamp
    this.content = assert(!content || typeof content ==='string') || content
    this.children = assert(!children || children instanceof Array) || children
  }
}

module.exports = {
  ContentTree,
  ContentTreeEntry,
}

const postsJSON = [
  {
    "type": "text",
    "title": "Olay ve Olasılık",
    "cover": "/turkce/olay-ve-olasilik/sorgular.jpg",
    "media": "",
    "summary": "<h3>Ağaç sorguları</h3>\n<p>Ağaçlarda kendimizi görebiliriz. Sınırsız şekillerde dallar her göz için farklı kesişir.\nAkla basit gelen bir dizi genetik kuralın sonucu olarak bu ağaçlar bizi farklı düşlere koyar.\n",
    "tags": [
      {
        "tag": "deneme",
        "slug": "deneme",
        "permalink": "/tags/deneme"
      }
    ],
    "date": "2022-12-31, 00:43",
    "coverAlt": "Ağaçlar olasılıklarını dallarıyla olaya döker",
    "coverShape": "roundTop",
    "coverPosition": "center bottom",
    "musiclist": [
      "Boards of Canada - Sunshine Recorder",
      "Massive Attack - Pray for Rain",
      "Massive Attack - I Against I",
      "Duman - Dibine Kadar"
    ],
    "slug": "olay-ve-olasilik",
    "permalink": "/turkce/olay-ve-olasilik",
    "category": {
      "name": "Türkçe",
      "permalink": "/turkce"
    },
    "path": "Türkçe/Olay ve Olasılık/post.md",
    "handle": "Türkçe/Olay ve Olasılık",
    "foldered": true,
    "localAssets": [
      {
        "name": "ben.jpg",
        "path": "Türkçe/Olay ve Olasılık/ben.jpg",
        "depth": 2,
        "extension": ".jpg",
        "isFolder": false,
        "type": "localAsset"
      },
      {
        "name": "sorgular.jpg",
        "path": "Türkçe/Olay ve Olasılık/sorgular.jpg",
        "depth": 2,
        "extension": ".jpg",
        "isFolder": false,
        "type": "localAsset"
      }
    ],
    "publishDate": "2022-12-30T21:43:00.000Z",
    "publishDateUTC": "Fri, 30 Dec 2022 21:43:00 GMT",
    "publishDateFull": "Saturday, December 31, 2022",
    "publishDateLong": "December 31, 2022",
    "publishDateMedium": "Dec 31, 2022",
    "publishDateShort": "12/31/22",
    "links": {
      "previousPost": {
        "title": "Herhangi bir text post",
        "permalink": "/turkce/herhangi-bir-text-post.html"
      },
      "relevantPosts": [],
      "mentionedTo": [],
      "mentionedBy": []
    }
  }
]

const linksJSON = [
  {
    "url": "https://www.smashingmagazine.com/2018/04/best-practices-grid-layout",
    "title": "Best Practices With CSS Grid Layout",
    "tags": [
      "css",
      "grid",
      "frontend"
    ],
    "datePublished": 1532221014000
  },
  {
    "url": "https://www.wikiwand.com/en/Emergence",
    "title": "Emergence",
    "tags": [
      "philosophy",
      "science",
      "art",
      "wiki"
    ],
    "datePublished": 1532255602000
  }
]
