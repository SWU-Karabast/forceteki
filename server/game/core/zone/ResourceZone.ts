import type { TokenOrPlayableCard } from '../card/CardTypes';
import { ZoneName, RelativePlayer, KeywordName } from '../Constants';
import type Player from '../Player';
import { SimpleZone } from './SimpleZone';
import * as Helpers from '../utils/Helpers.js';
import type { AbilityContext } from '../ability/AbilityContext';

export class ResourceZone extends SimpleZone<TokenOrPlayableCard> {
    public override readonly hiddenForPlayers: RelativePlayer.Opponent;
    public override readonly name: ZoneName.Resource;

    public get exhaustedResourceCount() {
        return this.exhaustedResources.length;
    }

    public get exhaustedResources() {
        return this._cards.filter((card) => card.exhausted);
    }

    public get readyResourceCount() {
        return this.readyResources.length;
    }

    public get readyResources() {
        return this._cards.filter((card) => !card.exhausted);
    }

    public constructor(owner: Player) {
        super(owner);

        this.hiddenForPlayers = RelativePlayer.Opponent;
        this.name = ZoneName.Resource;
    }

    public rearrangeResourceExhaustState(context: AbilityContext, prioritizeSmuggle: boolean = false): void {
        const exhaustCount = this.exhaustedResourceCount;
        this._cards.forEach((card) => card.exhausted = false);
        Helpers.shuffleArray(this._cards, context.game.randomGenerator);

        let exhausted = 0;

        if (prioritizeSmuggle) {
            for (let i = 0; i < exhaustCount; i++) {
                if (this._cards[i].hasSomeKeyword(KeywordName.Smuggle)) {
                    this._cards[i].exhausted = true;
                    exhausted++;
                }
            }
        }
        for (let i = 0; i < exhaustCount; i++) {
            if (this._cards[i].exhausted === false) {
                this._cards[i].exhausted = true;
                exhausted++;
            }
            if (exhausted === exhaustCount) {
                break;
            }
        }
    }
}
