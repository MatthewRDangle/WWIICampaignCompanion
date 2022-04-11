import Faction from './Faction.js';
import {activeScenario} from "../../global.js";
import Tile from "./Tile.js";

export default class Unit {
    constructor(owner, options) {
        if ( !(owner instanceof Faction) )
            throw Error('A unit must be assigned to a faction.');

        this.faction = owner;
        this.isSelected = false;
        this.name = options?.name || 'Unit';
        this.icon = options?.icon || undefined;
        this.health = options?.health || 1;

        this.available_movement = options?.available_movement || 1;
        this.movement_cap = options?.movement_cap || 1;
        this.canMoveTo = {};

        this.tile = undefined;
    }

    attachTile(tile) {
        if (tile instanceof Tile)
            this.tile = tile;
    }

    eligibleMoves() {
        const eligible_moves = {};
        const unitOwner = this.faction;
        if (this.tile instanceof Tile)
            checkMovement(this.tile, this.available_movement);
        this.canMoveTo = eligible_moves;
        return eligible_moves; // All eligible moves w/ remaining movement after moving.

        function checkMovement(tile, available_movement) {
            if (tile.isContested)
                return

            let movement_info = tile.adjacentMovementCost();
            for (let tileId in movement_info) {
                const movement_cost = movement_info[tileId];
                if ( movement_cost <= available_movement) {
                    const remaining_movement = available_movement - movement_cost;

                    // Check if tile already exists. If it does overwrite it if the new route has the highest available_movement remaining.
                    if (eligible_moves.hasOwnProperty(tileId) && eligible_moves[tileId] < remaining_movement)
                        eligible_moves[tileId] = remaining_movement;

                    // If it doesn't exist, add it.
                    else if (!eligible_moves.hasOwnProperty(tileId))
                        eligible_moves[tileId] = remaining_movement;

                    // Otherwise skip, because it shouldn't be added since it's a smaller number.
                    else
                        continue

                    // If there is any available movement left, repeat; unless it's an enemy unit is preventing movement.
                    if (remaining_movement > 0) {
                        const [row, column] = tileId.split('-');
                        const tile = activeScenario.tiles[row][tileId];
                        if (row > 0 && (tile.owner === unitOwner || tile.owner === undefined)) {
                            checkMovement(tile, remaining_movement);
                        }
                    }
                }
            }
        }
    }

    death() {
        if (activeScenario.selectedUnit === this)
            activeScenario.selectedUnit = undefined;
        this.tile.removeUnit(this);
    }

    detachTile() {
        this.tile = undefined;
    }

    deselect() {
        this.isSelected = false;
        this.canMoveTo = {};
        if (activeScenario.selectedUnit instanceof Unit && activeScenario.selectedUnit === this)
            activeScenario.selectedUnit = undefined;
    }

    moveTo(tile) {
        if (this.tile) {
            const eligibleMoves = this.canMoveTo;
            for(let key in eligibleMoves) {
                const new_available_movement = eligibleMoves[key];
                if (tile.id === key && this.available_movement >= new_available_movement) {
                    this.warpTo(tile);
                    activeScenario.unitMoved(this);
                    this.deselect();
                    this.available_movement = new_available_movement;

                    if (tile.owner !== this.faction)
                        tile.contest();
                }
            }
        }
    }

    reduceHealth(int) {
        if (int < this.health) {
            this.health -= int;
            return 0;
        }
        else {
            const preHealth = this.health;
            this.death();
            return int - preHealth;
        }
    }

    replenish() {
        this.available_movement = this.movement_cap;
    }

    select() {
        this.isSelected = true;
        this.eligibleMoves();
        if (activeScenario.selectedUnit instanceof Unit && activeScenario.selectedUnit !== this)
            activeScenario.selectedUnit.deselect();
        activeScenario.selectedUnit = this;
    }

    warpTo(tile) {
        if (tile instanceof Tile && tile !== this.tile) {
            this.tile.removeUnit(this);
            tile.addUnit(this);
        }
    }
}