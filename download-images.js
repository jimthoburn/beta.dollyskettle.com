import fs from "fs-extra";
import mkdirp from "mkdirp";
import fetch from "node-fetch";

import { config }       from "./_config.js";

import { normalizeURL } from "./helpers/url.js";

import { refreshData,
         getMediaURLs,
         getMedia,
         getPreviouslyDownloadedMedia } from "./data/post.js";

const { AUTHORIZATION_HEADER_VALUE } = process.env;

const authorizedFetch = function(url) {
  return fetch(url, {
    headers: {
      'Authorization': AUTHORIZATION_HEADER_VALUE,
    },
  });
}

function downloadImage(url) {
  const urlBits = normalizeURL(url).split("/");

  // IMG_8473-770x1024.jpg
  const imageName = urlBits.pop();

  // wp-content/uploads/2020/04
  const imagePath = urlBits.join("/");

  // ./_pictures/2020/04/
  const writePath = `./_pictures/${imagePath}/`.replace("/wp-content/uploads/", "/");

  const image = getMedia(url);
  const previouslyDownloadedImage = getPreviouslyDownloadedMedia(url);

  if (previouslyDownloadedImage && previouslyDownloadedImage.modified_gmt === image.modified_gmt) {
    // console.log("Skipping because the file has already been downloaded: ")
    // console.log(`${writePath}${imageName}`);

    // https://stackoverflow.com/questions/20936486/node-js-maximum-call-stack-size-exceeded
    setTimeout( function() {
      processNext();
    }, 0 );

    return;
  }

  authorizedFetch(`${config.data.host}${url}`)
    .then(res => {
      return new Promise(async (resolve, reject) => {
        try {
          const folder = await mkdirp(writePath);
          const dest = fs.createWriteStream(`${writePath}${imageName}`);
          res.body.pipe(dest);
          res.body.on("error", err => {
            reject(err);
          });
          dest.on("finish", () => {
            resolve();
          });
          dest.on("error", err => {
            reject(err);
          });
        } catch(e) {
          console.error(err);
        }
      });
    })
    .then(() => {
      console.log("successfully downloaded: ");
      console.log(url);
    })
    .catch(err => {
      console.log("error while downloading: ");
      console.log(url);
      console.log(err);
    })
    .finally(processNext);

  // saveMarkdown(filename, data)
}

let processNext;

function download(urls) {
  console.log(urls);

  let cursor = -1;

  processNext = function() {
    cursor++;
    if (cursor >= urls.length) return;

    downloadImage(urls[cursor]);
  }

  processNext();
}

refreshData().then(() => {
  download(getMediaURLs());
});
