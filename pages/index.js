
import { createElement }  from "../web_modules/preact.js";
import   htm              from "../web_modules/htm.js";
const    html = htm.bind(createElement);

import { normalizeURL } from "../helpers/url.js";


function IndexPage({ posts }) {

  return html`
  <header>
    <div class="container">
      <h1>Recipe List</h1>
    </div>
  </header>

  <div class="alphabetical-recipe-list">
    <ul>
      ${posts.map(post => {
          return html`
          <li><a href="/${ normalizeURL(post.link) }/" dangerouslySetInnerHTML=${ { __html: post.title.rendered } }></a></li>
          `;
      })}
    </ul>
  </div>
  `;

  // return html`
  //   <${PictureGallery}
  //     album="${album}"
  //     pictures="${pictures}"
  //     story="${story}"
  //     getPageURL="${getPageURL}" />
  // `;
}


export { IndexPage };
