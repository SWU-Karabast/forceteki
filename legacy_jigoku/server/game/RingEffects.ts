import { GameModes } from '../GameModes';
import { AirRingEffect } from './Rings/AirRingEffect';
import { EarthRingEffect } from './Rings/EarthRingEffect';
import { FireRingEffect } from './Rings/FireRingEffect';
import { VoidRingEffect } from './Rings/VoidRingEffect';
import { WaterRingEffect } from './Rings/WaterRingEffect';
import { AbilityContext } from './AbilityContext';
import BaseAbility = require('./baseability');
import Player = require('./player');

type Element = 'air' | 'earth' | 'fire' | 'void' | 'water';

type RingProps = {
    name: string;
    factory: (optional: boolean, gameMode: GameModes) => RingAbility;
};

interface RingAbility extends BaseAbility {
    title: string;
    cannotTargetFirst: boolean;
    defaultPriority: number;
    executeHandler(context: AbilityContext): void;
}

type ResolutionCb = (resolved: boolean) => void;

function ringForElement(element: string) {
    switch (element) {
        case 'air':
            return (optional: boolean, gameMode: GameModes, onResolution: ResolutionCb) =>
                new AirRingEffect(optional, gameMode, onResolution);
        case 'earth':
            return (optional: boolean, gameMode: GameModes, onResolution: ResolutionCb) =>
                new EarthRingEffect(optional, gameMode, onResolution);
        case 'fire':
            return (optional: boolean, gameMode: GameModes, onResolution: ResolutionCb) =>
                new FireRingEffect(optional, onResolution);
        case 'void':
            return (optional: boolean, gameMode: GameModes, onResolution: ResolutionCb) =>
                new VoidRingEffect(optional, onResolution);
        case 'water':
            return (optional: boolean, gameMode: GameModes, onResolution: ResolutionCb) =>
                new WaterRingEffect(optional, gameMode, onResolution);
        default:
            throw new Error(`Unknown ring effect of ${element}`);
    }
}

export class RingEffects {
    static contextFor(
        player: Player,
        element: string,
        optional = true,
        onResolution: ResolutionCb = () => {}
    ): Omit<AbilityContext, 'ability'> & { ability: RingAbility } {
        const ring = ringForElement(element);
        const context: any = player.game.getFrameworkContext(player);
        context.source = player.game.rings[element];
        const gameModeWithDefault = context.game.gameMode || GameModes.Stronghold;
        context.ability = ring(optional, gameModeWithDefault, onResolution);
        return context;
    }

    static getRingName(element: string) {
        switch (element) {
            case 'air':
                return 'Air Ring';
            case 'earth':
                return 'Earth Ring';
            case 'fire':
                return 'Fire Ring';
            case 'void':
                return 'Void Ring';
            case 'water':
                return 'Water Ring';
            default:
                return undefined;
        }
    }
}