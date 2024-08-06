import type { AbilityContext } from '../../../AbilityContext';
import { CardTypes } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type Player from '../../../player';
import type Ring from '../../../ring';

function getNumberOfMonks(context: AbilityContext) {
    return (context.player.cardsInPlay as Array<DrawCard>).reduce(
        (total, card) => total + (card.getType() === CardTypes.Character && card.hasTrait('monk') ? 1 : 0),
        0
    );
}

class Process {
    #chosenRings = [] as Array<Ring>;
    constructor(
        private maxRings: number,
        private context: AbilityContext
    ) {}

    public promptPlayer() {
        this.context.game.promptForRingSelect(this.context.player, {
            activePromptTitle: this.#promptTitle(),
            context: this.context,
            buttons: this.#buttons(),
            ringCondition: (ring: Ring) =>
                ring.isConsideredClaimed(this.context.player) && !this.#chosenRings.includes(ring),
            onSelect: (_player: Player, ring: Ring) => {
                this.#chosenRings.push(ring);
                if (
                    Object.values(this.context.game.rings).some(
                        (ring) =>
                            ring.isConsideredClaimed(this.context.player) &&
                            !this.#chosenRings.includes(ring) &&
                            this.#chosenRings.length < this.maxRings
                    )
                ) {
                    this.promptPlayer();
                    return true;
                }

                return this.#resolveRings();
            },
            onMenuCommand: (player: Player) => {
                this.context.game.addMessage('{0} resolves {1}', player, this.#chosenRings);
                const action = this.context.game.actions.resolveRingEffect({ target: this.#chosenRings });
                const events = [];
                action.addEventsToArray(events, this.context.game.getFrameworkContext(player));
                this.context.game.openThenEventWindow(events);
                return true;
            }
        });
    }

    #buttons() {
        return this.#chosenRings.length > 0 ? [{ text: 'Done', arg: 'done' }] : [];
    }

    #resolveRings() {
        this.context.game.addMessage('{0} resolves {1}', this.context.player, this.#chosenRings);
        const action = this.context.game.actions.resolveRingEffect({
            target: this.#chosenRings,
            enforceOrderedResolution: true
        });
        const events = [];
        action.addEventsToArray(events, this.context.game.getFrameworkContext(this.context.player));
        this.context.game.openThenEventWindow(events);
        return true;
    }

    #promptTitle(): string {
        switch (this.#chosenRings.length) {
            case 0:
                return 'Choose the first ring to resolve';
            case 1:
                return 'Choose the second ring to resolve';
            case 2:
                return 'Choose the third ring to resolve';
            case 3:
                return 'Choose the fourth ring to resolve';
            case 4:
            default:
                return 'Choose the fifth ring to resolve';
        }
    }
}

export default class RiddlesOfTheHenshin extends DrawCard {
    static id = 'riddles-of-the-henshin';

    setupCardAbilities() {
        this.action({
            title: 'Resolve ring effects',
            condition: (context) => getNumberOfMonks(context) > 0 && context.player.getClaimedRings().length > 0,
            handler: (context) => new Process(getNumberOfMonks(context), context).promptPlayer(),
            effect: 'resolve ring effects'
        });
    }
}