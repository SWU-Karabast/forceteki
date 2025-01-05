import { OngoingEffect } from './OngoingEffect';
import type { RelativePlayerFilter } from '../Constants';
import { RelativePlayer, WildcardRelativePlayer } from '../Constants';
import type { OngoingEffectImpl } from './effectImpl/OngoingEffectImpl';
import type Game from '../Game';
import type { Card } from '../card/Card';
import type { IOngoingPlayerEffectProps } from '../../Interfaces';
import type Player from '../Player';

export class OngoingPlayerEffect extends OngoingEffect {
    public override matchTarget: (target: Player) => boolean;
    public targetController: Player | RelativePlayerFilter;

    public constructor(game: Game, source: Card, properties: IOngoingPlayerEffectProps, effect: OngoingEffectImpl<any>) {
        super(game, source, properties, effect);
        if (typeof this.matchTarget !== 'function') {
            this.matchTarget = (_player) => true;
        }

        this.targetController = properties.targetController || RelativePlayer.Self;
    }

    /** @override */
    public override isValidTarget(target: Player) {
        if (this.targetController !== WildcardRelativePlayer.Any && this.targetController !== RelativePlayer.Self && this.targetController !== RelativePlayer.Opponent && this.targetController !== target) {
            return false;
        }

        if (this.targetController === RelativePlayer.Self && target === this.source.controller.opponent) {
            return false;
        } else if (this.targetController === RelativePlayer.Opponent && target === this.source.controller) {
            return false;
        }
        return true;
    }

    /** @override */
    public override getTargets() {
        return this.game.getPlayers().filter((player) => this.matchTarget(player));
    }
}
