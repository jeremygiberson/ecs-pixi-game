import {getPost} from 'api';
import * as PIXI from 'pixi.js'

async function HelloWorld() {
    const div = document.createElement('div');
    const h1 = document.createElement('h1');
    const h1Text = document.createTextNode('Hello Webpack-Babel-Boilerplate!');
    
    div.className = 'main';
    h1.appendChild(h1Text);
    document.body.appendChild(div);
    div.appendChild(h1);

    const postId = 1;
    const post = await getPost(postId);

    const postTitle = post.title || 'Oops title was null!';
    const p = document.createElement('p');
    const pText = document.createTextNode(postTitle);

    p.appendChild(pText);
    div.appendChild(p);

    const app = new PIXI.Application();

// The application will create a canvas element for you that you
// can then insert into the DOM.
    document.body.appendChild(app.view);
}

export default HelloWorld;