import { OngoingEffect } from './OngoingEffect';
import type { OngoingEffectImpl } from './effectImpl/OngoingEffectImpl';
import type Game from '../Game';
import type { Card } from '../card/Card';
import type { IOngoingPlayerEffectProps } from '../../Interfaces';
import type { Player } from '../Player';
import { RelativePlayer, WildcardRelativePlayer } from '../Constants';

export class OngoingPlayerEffect extends OngoingEffect<Player> {
    public constructor(game: Game, source: Card, properties: IOngoingPlayerEffectProps, effect: OngoingEffectImpl<any>) {
        super(
            game,
            source,
            {
                matchTarget: (player) =>
                    (properties.targetController === RelativePlayer.Opponent ? source.controller.opponent === player
                        : properties.targetController === RelativePlayer.Self ? source.controller === player
                            : properties.targetController === WildcardRelativePlayer.Any ? true
                                : source.controller === player),
                ...properties
            },
            effect
        );
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
