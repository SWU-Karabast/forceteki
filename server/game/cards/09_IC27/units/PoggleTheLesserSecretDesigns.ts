import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { TextHelper } from '../../../core/utils/TextHelper';
import { WildcardCardType } from '../../../core/Constants';
import { ResolutionMode } from '../../../gameSystems/SimultaneousOrSequentialSystem';

export default class PoggleTheLesserSecretDesigns extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'poggle-the-lesser#secret-designs-id',
            internalName: 'poggle-the-lesser#secret-designs',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: `Pay ${TextHelper.resource(1)} and discard a card from your hand to make the next card you play this phase cost ${TextHelper.resource(3)} less`,
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.simultaneous((context) => ({
                resolutionMode: ResolutionMode.AllGameSystemsMustBeLegal,
                gameSystems: [
                    abilityHelper.immediateEffects.payResources({ amount: 1, target: context.player }),
                    abilityHelper.immediateEffects.discardCardsFromOwnHand({ amount: 1, target: context.player })
                ]
            })),
            ifYouDo: {
                title: `The next card you play this phase costs ${TextHelper.resource(3)} less`,
                immediateEffect: abilityHelper.immediateEffects.forThisPhasePlayerEffect({
                    effect: abilityHelper.ongoingEffects.decreaseCost({
                        cardTypeFilter: WildcardCardType.Playable,
                        limit: abilityHelper.limit.perGame(1),
                        amount: 3
                    })
                })
            }
        });
    }
}