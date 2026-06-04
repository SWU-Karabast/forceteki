import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType } from '../../../core/Constants';
import type { WhenType } from '../../../Interfaces';

export default class GreefKargaGraciousMagistrate extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7860748049',
            internalName: 'greef-karga#gracious-magistrate',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Exhaust this leader to give an Advantage token to that unit',
            contextTitle: (context) => `Exhaust ${context.source.title} to give an Advantage token to ${context.event.card.title}`,
            optional: true,
            when: this.makeTriggerCondition(),
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: (ifYouDoContext) => ({
                title: `Give an Advantage token to ${ifYouDoContext.event.card.title}`,
                immediateEffect: AbilityHelper.immediateEffects.giveAdvantage({
                    target: ifYouDoContext.event.card,
                }),
            }),
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give an Advantage token to that unit',
            contextTitle: (context) => `Give an Advantage token to ${context.event.card.title}`,
            when: this.makeTriggerCondition(),
            immediateEffect: AbilityHelper.immediateEffects.giveAdvantage((context) => ({
                target: context.event.card,
            })),
        });
    }

    private makeTriggerCondition(): WhenType {
        return {
            onCardPlayed: (event, context) =>
                event.player === context.player &&
                event.cardTypeWhenInPlay === CardType.BasicUnit,
            onUnitEntersPlay: (event, context) =>
                event.card.controller === context.player &&
                event.card.isToken(),
        };
    }
}
