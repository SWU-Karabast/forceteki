import AbilityDsl from '../../abilitydsl';
import type BaseCard from '../../basecard';
import { AbilityTypes, CardTypes, EventNames, Locations, PlayTypes } from '../../Constants';
import DrawCard from '../../drawcard';
import { EventRegistrar } from '../../EventRegistrar';
import type { TriggeredAbilityContext } from '../../TriggeredAbilityContext';

export default class DragonTattoo extends DrawCard {
    static id = 'dragon-tattoo';

    private cardPlayed = true;
    private extraBanzaiTarget?: BaseCard;
    private abilityRegistrar?: EventRegistrar;

    public setupCardAbilities() {
        this.abilityRegistrar = new EventRegistrar(this.game, this);
        this.abilityRegistrar.register([
            {
                [EventNames.OnInitiateAbilityEffects + ':' + AbilityTypes.WouldInterrupt]: 'onInitiateAbility'
            }
        ]);

        this.attachmentConditions({ myControl: true });

        this.whileAttached({ effect: AbilityDsl.effects.addTrait('tattooed') });

        this.reaction({
            when: {
                onCardPlayed: (event, context) =>
                    event.card.type === CardTypes.Event &&
                    event.card.controller === context.player &&
                    (event.card.location === Locations.ConflictDiscardPile ||
                        event.card.location === Locations.DynastyDiscardPile) &&
                    this.checkTargets(event, context)
            },
            title: 'Play card again',
            gameAction: AbilityDsl.actions.ifAble((context) => ({
                ifAbleAction: AbilityDsl.actions.playCard(() => {
                    this.cardPlayed = true;
                    return {
                        source: this,
                        // @ts-ignore
                        target: context.event.card,
                        resetOnCancel: true,
                        playType: PlayTypes.Other,
                        destination: Locations.RemovedFromGame,
                        payCosts: true,
                        allowReactions: true
                    };
                }),
                otherwiseAction: AbilityDsl.actions.moveCard(() => {
                    this.cardPlayed = false;
                    return {
                        // @ts-ignore
                        target: context.event.card,
                        destination: Locations.RemovedFromGame
                    };
                })
            })),
            effect: '{1}{2}{3}',
            effectArgs: (context) => [
                this.cardPlayed ? 'play ' : 'remove ',
                context.event.card.name,
                this.cardPlayed ? '' : ' from the game'
            ]
        });
    }

    public onInitiateAbility(event: any) {
        if (event.card.id === 'banzai' && event.context) {
            this.extraBanzaiTarget = event.context.targets.target;
        }
    }

    private checkTargets(event: any, context: TriggeredAbilityContext): boolean {
        if (!event.context) {
            return false;
        }

        for (const directTargets of Object.values<BaseCard | BaseCard[]>(event.context.targets)) {
            if (
                Array.isArray(directTargets)
                    ? directTargets.some((card) => this.isValidTargetForTattoo(card, context))
                    : this.isValidTargetForTattoo(directTargets, context)
            ) {
                return true;
            }
        }

        for (const selectedTargets of Object.values<BaseCard | BaseCard[]>(event.context.selects)) {
            if (
                Array.isArray(selectedTargets)
                    ? selectedTargets.some((card) => this.isValidTargetForTattoo(card, context))
                    : this.isValidTargetForTattoo(selectedTargets, context)
            ) {
                return true;
            }
        }

        if (event.card.id === 'banzai' && this.extraBanzaiTarget) {
            const prevExtraBanzaiTarget = this.extraBanzaiTarget;
            this.extraBanzaiTarget = undefined;
            if (this.isValidTargetForTattoo(prevExtraBanzaiTarget, context)) {
                return true;
            }
        }

        return false;
    }

    private isValidTargetForTattoo(card: BaseCard, context: TriggeredAbilityContext) {
        return (
            card.type === CardTypes.Character &&
            card.controller === context.player &&
            card === context.source.parent &&
            card.location === Locations.PlayArea
        );
    }
}