import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { AbilityType, RelativePlayer, ZoneName } from '../../../core/Constants';

export default class GarSaxonViceroyofMandalore extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9794215464',
            internalName: 'gar-saxon#viceroy-of-mandalore',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each friendly upgraded unit gets +1/+0',
            targetController: RelativePlayer.Self,
            matchTarget: (card) => card.isUnit() && card.isUpgraded(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each friendly upgraded unit gets +1/+0 and gains "When Defeated: You may return an upgrade that was attached to this unit to its owner\'s hand."',
            targetController: RelativePlayer.Self,
            matchTarget: (card) => card.isUnit() && card.isUpgraded(),
            ongoingEffect: [
                AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
                AbilityHelper.ongoingEffects.gainAbility({
                    type: AbilityType.Triggered,
                    title: 'Return an upgrade that was attached to this unit to its owner\'s hand',
                    optional: true,
                    when: {
                        whenDefeated: true
                    },
                    targetResolver: {
                        zoneFilter: ZoneName.Discard,
                        cardCondition: (card, context) => context.event?.lastKnownInformation?.upgrades.includes(card),
                        immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                    }
                })
            ]
        });
    }
}