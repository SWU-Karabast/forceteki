import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class DarkSecret extends DrawCard {
    static id = 'dark-secret';

    setupCardAbilities() {
        this.reaction({
            title: 'Make the controller of attached character lose 1 honor',
            when: {
                onMoveFate: (event, context) =>
                    context.source.parent && context.source.parent === event.origin && event.fate > 0
            },
            gameAction: AbilityDsl.actions.loseHonor((context) => ({
                amount: 1,
                target: this.#targetPlayer(context.source.parent)
            })),
            limit: AbilityDsl.limit.unlimitedPerConflict(),
            effect: 'make {1} lose 1 honor - {2}',
            effectArgs: (context) => [this.#targetPlayer(context.source.parent), this.#quote(context.source.parent)]
        });
    }

    #targetPlayer(character: DrawCard) {
        return character.controller;
    }

    #quote(character: DrawCard): string {
        switch (((character.printedCost ?? 0) + character.name.charCodeAt(0) + character.fate) % 7) {
            case 0:
                return 'Man is not what he thinks he is, he is what he hides';
            case 1:
                return 'What is Man? A miserable little pile of secrets';
            case 2:
                return "I don't argue with my enemies; I explain to their children";
            case 3:
                return 'With a secret like that, at some point the secret itself becomes irrelevant. The fact that you kept it does not';
            case 4:
                return "A secret's worth depends on the people from whom it must be kept";
            case 5:
                return 'Three may keep a secret, if two of them are dead';
            case 6:
                return 'All the secrets of the world worth knowing are hiding in plain sight';
        }
    }
}
