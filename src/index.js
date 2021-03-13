import HelloWorld from 'components/HelloWorld';
import SetupPixijs from "./components/SetupPixijs";
import SetupGame from "./components/SetupGame";
import 'main.css';

const main = async () => {
    let app = await SetupPixijs();
    let game = await SetupGame(app);

    game.run();
}

main().then(() => console.log('Started'));