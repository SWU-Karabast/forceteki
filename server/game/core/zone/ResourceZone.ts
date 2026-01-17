import { ZoneName, RelativePlayer } from '../Constants';
import type { Player } from '../Player';
import { PlayerZone } from './PlayerZone';
import * as Helpers from '../utils/Helpers.js';
import type { AbilityContext } from '../ability/AbilityContext';
import type { IPlayableCard } from '../card/baseClasses/PlayableOrDeployableCard';
import type Game from '../Game';

export class ResourceZone extends PlayerZone<IPlayableCard> {
    public override readonly hiddenForPlayers: RelativePlayer.Opponent;
    public override readonly name: ZoneName.Resource;

    public get exhaustedResourceCount() {
        let count = 0;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].exhausted) {
                count++;
            }
        }
        return count;
    }

    public get exhaustedResources(): readonly IPlayableCard[] {
        return this.cards.filter((card) => card.exhausted);
    }

    public get readyResourceCount() {
        let count = 0;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.cards.length; i++) {
            if (!this.cards[i].exhausted) {
                count++;
            }
        }
        return count;
    }

    public get readyResources(): readonly IPlayableCard[] {
        return this.cards.filter((card) => !card.exhausted);
    }

    public constructor(game: Game, owner: Player) {
        super(game, owner);

        this.hiddenForPlayers = RelativePlayer.Opponent;
        this.name = ZoneName.Resource;
    }

    public rearrangeResourceExhaustState(context: AbilityContext, priorityCondition: (resource: IPlayableCard) => boolean = () => false): void {
        const exhaustCount = this.exhaustedResourceCount;
        // Cards is an accessor and a copy of the array.
        const cards = this._cards.concat();
        cards.forEach((card) => card.exhausted = false);
        Helpers.shuffleArray(cards, context.game.randomGenerator);

        this._cards = cards;

        let exhausted = 0;

        for (let i = 0; i < this._cards.length; i++) {
            if (priorityCondition(cards[i])) {
                cards[i].exhausted = true;
                exhausted++;
            }
            if (exhausted === exhaustCount) {
                break;
            }
        }

        if (exhausted < exhaustCount) {
            for (let i = 0; i < exhaustCount; i++) {
                if (cards[i].exhausted === false) {
                    cards[i].exhausted = true;
                    exhausted++;
                }
                if (exhausted === exhaustCount) {
                    break;
                }
            }
        }
    }
}
