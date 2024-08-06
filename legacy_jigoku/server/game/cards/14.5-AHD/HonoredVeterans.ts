import type { AbilityContext } from '../../AbilityContext';
import AbilityDsl from '../../abilitydsl';
import type BaseCard from '../../basecard';
import { CardTypes, EventNames, Players } from '../../Constants';
import DrawCard from '../../drawcard';
import { EventRegistrar } from '../../EventRegistrar';

export default class HonoredVeterans extends DrawCard {
    static id = 'honored-veterans';

    private eventRegistrar?: EventRegistrar;
    private charactersPlayedThisPhase = new Set<BaseCard>();

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([EventNames.OnPhaseStarted, EventNames.OnCardPlayed]);

        this.action({
            title: 'Honor characters',
            condition: () => this.canBePlayed(),
            targets: {
                myCharacter: {
                    cardType: CardTypes.Character,
                    controller: Players.Self,
                    optional: true,
                    hideIfNoLegalTargets: true,
                    cardCondition: (card) => card.hasTrait('bushi') && this.wasCharacterPlayedThisPhase(card),
                    gameAction: AbilityDsl.actions.honor()
                },
                oppCharacter: {
                    player: Players.Opponent,
                    cardType: CardTypes.Character,
                    controller: Players.Opponent,
                    optional: true,
                    hideIfNoLegalTargets: true,
                    cardCondition: (card) => card.hasTrait('bushi') && this.wasCharacterPlayedThisPhase(card),
                    gameAction: AbilityDsl.actions.honor()
                }
            },
            effect: 'honor {1}',
            effectArgs: (context) => [this.getCharacters(context)]
        });
    }

    public onCardPlayed(event: any) {
        if (event.player && event.card.type === CardTypes.Character) {
            this.charactersPlayedThisPhase.add(event.card);
        }
    }

    public onPhaseStarted() {
        this.charactersPlayedThisPhase.clear();
    }

    private canBePlayed(): boolean {
        for (const card of this.charactersPlayedThisPhase) {
            if (card.hasTrait('bushi')) {
                return true;
            }
        }
        return false;
    }

    private wasCharacterPlayedThisPhase(card: BaseCard): boolean {
        return this.charactersPlayedThisPhase.has(card);
    }

    private getCharacters(context: AbilityContext): Array<string | DrawCard> {
        const characters: Array<string | DrawCard> = [];
        if (context.targets.myCharacter && !Array.isArray(context.targets.myCharacter)) {
            characters.push(context.targets.myCharacter);
        }
        if (context.targets.oppCharacter && !Array.isArray(context.targets.oppCharacter)) {
            characters.push(context.targets.oppCharacter);
        }
        if (characters.length === 0) {
            characters.push('no one');
        }

        return characters;
    }
}
