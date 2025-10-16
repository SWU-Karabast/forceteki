import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventName } from '../../../core/Constants';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import { DiscloseMode } from '../../../gameSystems/DiscloseAspectsSystem';

export default class EbonHawkCauseAndEffect extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0309087588',
            internalName: 'ebon-hawk#cause-and-effect'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Heroism, Aspect.Villainy];
        registrar.addOnAttackAbility({
            title: 'Disclose Heroism to give this unit +2/+0 and/or Villainy to give the defending unit -4/-0 for this attack',
            immediateEffect: AbilityHelper.immediateEffects.disclose({
                aspects: aspects,
                mode: DiscloseMode.Some
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'If you disclosed Heroism, this unit gets +2/+0 for this attack. If you disclosed Villainy, give the defender -4/-0 for this attack.',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.conditional({
                        condition: this.disclosedCardsContainAspect(Aspect.Heroism, ifYouDoContext),
                        onTrue: AbilityHelper.immediateEffects.forThisAttackCardEffect({
                            target: ifYouDoContext.source,
                            effect: AbilityHelper.ongoingEffects.modifyStats({
                                power: 2,
                                hp: 0
                            })
                        })
                    }),
                    AbilityHelper.immediateEffects.conditional({
                        condition: this.disclosedCardsContainAspect(Aspect.Villainy, ifYouDoContext),
                        onTrue: AbilityHelper.immediateEffects.forThisAttackCardEffect({
                            target: ifYouDoContext.event.attack.getAllTargets(),
                            effect: AbilityHelper.ongoingEffects.modifyStats({
                                power: -4,
                                hp: 0
                            })
                        })
                    })
                ])
            })
        });
    }

    private disclosedCardsContainAspect(aspect: Aspect, context: AbilityContext): boolean {
        const revealedAspects = context.events
            .filter((event) => event.name === EventName.OnAspectsDisclosed)
            .flatMap((event) => event.disclosedCards || [])
            .flatMap((card) => card.aspects);

        return revealedAspects.includes(aspect);
    }
}