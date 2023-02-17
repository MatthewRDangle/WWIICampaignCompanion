const m = require('mithril');

import Page from '../classes/Page.js';
import GameBoard from "../components/GameBoard.js"
import scenarioDefinitionStore from "../stores/ScenarioDefinition.store.js";


export const page = new Page('/session', (initialVnode) => {


    return {
        view: (vNode) => {
            const {activeScenarioDefinition} = scenarioDefinitionStore;

            return ([
                m('img', {
                    className: 'absolute top-0 left-0 object-cover w-full h-full -z-10',
                    src: 'images/background.png',
                    role: 'presentation'
                }),
                m('div', {className: 'w-screen h-screen'}, m(GameBoard, {scenario: activeScenarioDefinition}))
            ])
        }
    }
});
