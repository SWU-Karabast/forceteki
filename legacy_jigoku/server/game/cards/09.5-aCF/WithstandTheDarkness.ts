import AbilityDsl from '../../abilitydsl';
import type BaseCard from '../../basecard';
import { AbilityTypes, CardTypes, EventNames, Locations, Players } from '../../Constants';
import DrawCard from '../../drawcard';
import { EventRegistrar } from '../../EventRegistrar';
import type { TriggeredAbilityContext } from '../../TriggeredAbilityContext';

export default class WithstandTheDarkness extends DrawCard {
    static id = 'withstand-the-darkness';

    private currentTargets = new Set<BaseCard>();
    private extraBanzaiTarget?: BaseCard;
    private abilityRegistrar: EventRegistrar;

    setupCardAbilities() {
        this.abilityRegistrar = new EventRegistrar(this.game, this);
        this.abilityRegistrar.register([
            {
                [`${EventNames.OnInitiateAbilityEffects}:${AbilityTypes.WouldInterrupt}`]: 'onInitiateAbility'
            }
        ]);

        this.reaction({
            when: {
                onCardPlayed: (event, context) => {
                    if (event.card.type === CardTypes.Event && event.card.controller === context.player.opponent) {
                        this.currentTargets = this.getLegalWithstandTargets(event);
                        return this.currentTargets.size > 0;
                    }
                }
            },
            title: 'Place a fate on a character',
            target: {
                activePromptTitle: 'Choose a character to receive a fate',
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card, context) =>
                    this.currentTargets.has(card) && this.isValidTargetForWithstand(card, context),
                gameAction: AbilityDsl.actions.placeFate()
            },
            max: AbilityDsl.limit.perPhase(1)
        });
    }

    public onInitiateAbility(event: any) {
        if (event.card.id === 'banzai') {
            if (event.context) {
                this.extraBanzaiTarget = event.context.targets.target;
            }
        }
    }

    private getLegalWithstandTargets(event: any) {
        const allTargets = new Set<BaseCard>();
        if (!event.context) {
            return allTargets;
        }

        for (const directTargets of Object.values<BaseCard | BaseCard[]>(event.context.targets)) {
            if (!Array.isArray(directTargets)) {
                allTargets.add(directTargets);
                continue;
            }
            for (const directTarget of directTargets) {
                allTargets.add(directTarget);
            }
        }

        for (const selectedTargets of Object.values<BaseCard | BaseCard[]>(event.context.selects)) {
            if (!Array.isArray(selectedTargets)) {
                allTargets.add(selectedTargets);
                continue;
            }
            for (const selectedTarget of selectedTargets) {
                allTargets.add(selectedTarget);
            }
        }

        if (event.card.id === 'banzai') {
            if (this.extraBanzaiTarget) {
                allTargets.add(this.extraBanzaiTarget);
            }
            this.extraBanzaiTarget = undefined;
        }

        return allTargets;
    }

    private isValidTargetForWithstand(card: BaseCard, context: TriggeredAbilityContext) {
        return (
            card.type === CardTypes.Character &&
            card.isFaction('crab') &&
            card.controller === context.player &&
            card.location === Locations.PlayArea
        );
    }
}