import type { AbilityContext } from '../../../AbilityContext';
import { CardTypes, Locations, Phases, PlayTypes } from '../../../Constants';
import type { Cost } from '../../../Costs';
import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import DrawCard from '../../../drawcard';

function captureParentCost(): Cost {
    return {
        canPay() {
            return true;
        },
        resolve(context: AbilityContext) {
            context.costs.captureParentCost = context.source.parent;
        },
        pay() {}
    };
}

export default class DevelopingMasterpiece extends DrawCard {
    static id = 'developing-masterpiece';

    public setupCardAbilities() {
        this.whileAttached({
            effect: [AbilityDsl.effects.cannotParticipateAsAttacker(), AbilityDsl.effects.cannotParticipateAsDefender()]
        });

        this.persistentEffect({
            location: Locations.ConflictDiscardPile,
            effect: AbilityDsl.effects.canPlayFromOwn(Locations.ConflictDiscardPile, [this], this, PlayTypes.Other)
        });

        this.action({
            title: 'Gain honor',
            phase: Phases.Fate,
            condition: (context) => context.source.parent,
            cost: [captureParentCost(), AbilityDsl.costs.removeSelfFromGame()],
            gameAction: AbilityDsl.actions.gainHonor((context) => ({
                amount: this.getHonorGain(context),
                target: context.player
            })),
            effect: 'gain {1} honor',
            effectArgs: (context: AbilityContext) => [this.getHonorGain(context)],
            then: (context) => {
                const haiku = randomHaiku();
                if (haiku) {
                    haiku.forEach((line) => context.game.addMessage(`>> ${line}`));
                    context.game.addMessage('>>>> Matsuo Bashō <<<<');
                }
            }
        });
    }

    public canAttach(card: BaseCard): boolean {
        return (
            card.controller === this.controller &&
            card.getType() === CardTypes.Character &&
            (card.hasTrait('courtier') || card.hasTrait('artisan') || card.isFaction('crane')) &&
            super.canAttach(card)
        );
    }

    public canPlay(context: AbilityContext, playType: string): boolean {
        return context.game.currentPhase === Phases.Draw && super.canPlay(context, playType);
    }

    private getHonorGain(context: AbilityContext): number {
        return context.costs.captureParentCost
            ? context.costs.captureParentCost.getGlory()
            : context.source.parent.getGlory();
    }
}

/**
 * @see https://www.carlsensei.com/classical/index.php/author/view/1
 */

const haikus = [
    ['Ah! The ancient pond', 'As a frog takes the plunge', 'Sound of the water'],
    ["The octopus' fleeting dream", 'in the trap', 'the summer moon'],
    ['Another year is gone;', 'and I still wear', 'straw hat and straw sandal.'],
    ['Along this road', 'Goes no one,', 'This autumn eve.'],
    ['Sick on a journey,', 'my dreams wander', 'the withered fields'],
    ['Even in Kyoto—', "hearing the cuckoo's cry—", 'I long for Kyoto'],
    ['One field', 'did they plant.', 'I, under the willow.'],
    ['This pervasive silence', 'Enhanced yet by cicadas simmering', 'Into the Temple Rocks dissipating'],
    ['Dividing like clam', 'and shell, I leave for Futami—', 'Autumn is passing by'],
    ['Turbulent the sea—', 'across to Sado stretches', 'the Milky Way'],
    ['Plagued by fleas and lice,', 'I hear the horses stalling', 'Right by my pillow'],
    ['Underneath the trees', 'soups and salads are buried', 'in cherry blossoms'],
    ['The true beginnings', 'Of poetry—an Oku', 'Rice-planting song'],
    ['The man in the moon', 'Has become homeless;', 'Rain clouded night'],
    ['Though I would move the grave,', 'my teary cry', 'was lost in the autumn wind.'],
    ['I am one', 'Who eats his breakfast,', 'Gazing at morning glories.'],
    ['Deep autumn—', 'my neighbor,', 'how does he live, I wonder?'],
    ['Not this human sadness,', 'cuckoo,', 'but your solitary cry.'],
    ['Sad nodes', "we're all the bamboo's children", 'in the end'],
    ['Sweet-smelling rice fields!', 'To our right as we push through,', 'The Ariso Sea.'],
    ['The whitebait', 'opens its eye', 'in the net of the law'],
    ['Should I take it in my hand,', 'it would disappear with my hot tears,', 'like the frost of autumn.'],
    ['The summer grasses—', "Of the brave soldiers' dreams", 'The aftermath.']
];
function randomHaiku(): string[] {
    return haikus[Math.floor(haikus.length * Math.random())];
}
