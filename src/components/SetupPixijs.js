import * as PIXI from 'pixi.js';
import PixiFps from "pixi-fps";

async function SetupPixijs() {
  const app = new PIXI.Application(
    {resizeTo: window}
//    {width: 100, height: 100}
  );
  console.log('webgl supported?', PIXI.utils.isWebGLSupported())
  console.log('webgl used?', app.renderer instanceof PIXI.Renderer);

  app.renderer.backgroundColor = 0xcccccc;

  document.body.appendChild(app.view);

  const fpsCounter = new PixiFps();

  app.stage.addChild(fpsCounter);

  app.stage.interactive=true;

  return app;
}

export default SetupPixijs;