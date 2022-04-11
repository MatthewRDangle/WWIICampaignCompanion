const m = require('mithril');
import Page from '../classes/Page.js';
import BattleResultCalc from "../components/BattleResultCalc.js";
import {activeScenario} from "../../global.js";

export const page = new Page('/battle/:tileId', (initialVnode) => {

    return {
        view: (vNode) => {
            const {attrs} = vNode;
            const tileId = attrs.tileId;
            const [row, column] = tileId.split('-');
            const tile = activeScenario.tiles[row][tileId];

            return [
                m('h1', 'Battle Results'),
                m(BattleResultCalc, {tile: tile})
            ]
        }
    }
});