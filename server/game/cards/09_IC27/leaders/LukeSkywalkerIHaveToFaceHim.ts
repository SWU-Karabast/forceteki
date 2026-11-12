import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class LukeSkywalkerIHaveToFaceHim extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9304999994',
            internalName: 'luke-skywalker#i-have-to-face-him',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Draw 2 more cards in starting hand',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStartingHandSize({
                amount: 2
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Discard a card to give this unit +2/+0 for this attack',
            contextTitle: (context) => `Discard a card to give ${context.source.title} +2/+0 for this attack`,
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: `${ifYouDoContext.source.title} gets +2/+0 for this attack`,
                immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: +2, hp: +0 })
                })
            })
        });
    }
}
