import { OngoingEffect } from './OngoingEffect';
import type { OngoingEffectImpl } from './effectImpl/OngoingEffectImpl';
import type Game from '../Game';
import type { Card } from '../card/Card';
import type { IOngoingPlayerEffectProps } from '../../Interfaces';
import type { Player } from '../Player';
import { RelativePlayer, WildcardRelativePlayer } from '../Constants';
import type { AbilityContext } from '../ability/AbilityContext';

export class OngoingPlayerEffect extends OngoingEffect<Player> {
    public constructor(game: Game, source: Card, properties: IOngoingPlayerEffectProps, effect: OngoingEffectImpl<any>) {
        let matchTarget: (target: Player, context: AbilityContext) => boolean;

        switch (properties.targetController) {
            case RelativePlayer.Opponent:
                matchTarget = (player) => source.controller.opponent === player;
                break;
            case WildcardRelativePlayer.Any:
                matchTarget = () => true;
                break;
            case RelativePlayer.Self:
            default:
                matchTarget = (player) => source.controller === player;
                break;
        }

        const propsForSuper = { matchTarget, ...properties };

        super(game, source, propsForSuper, effect);
    }

    public override isValidTarget(target: Player) {
        if (typeof this.matchTarget !== 'function') {
            return target === this.matchTarget;
        }

        return this.matchTarget(target, this.context);
    }

    public override getTargets() {
        return this.game.getPlayers();
    }
}
