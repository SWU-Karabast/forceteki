import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { GameSystem } from '../../../core/gameSystem/GameSystem';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';

export default class AllegiantGeneralPrydeHeartlessEfficiency extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'allegiant-general-pryde#heartless-efficiency-id',
            internalName: 'allegiant-general-pryde#heartless-efficiency',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Give an Experience token to the friendly unit with the most power',
            immediateEffect: this.buildGiveExperienceToStrongestFriendlyUnitEffect(abilityHelper),
        });
    }

    private buildGiveExperienceToStrongestFriendlyUnitEffect(abilityHelper: IAbilityHelper): GameSystem<TriggeredAbilityContext<this>> {
        return abilityHelper.immediateEffects.conditional((context) => {
            const friendlyUnits = context.player.getArenaUnits();
            const maxPower = friendlyUnits.map((x) => x.getPower()).reduce((p, c) => (p > c ? p : c), 0);

            return {
                condition: friendlyUnits.filter((x) => x.getPower() === maxPower).length > 1,
                onTrue: abilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    cardCondition: (card) => card.isUnit() && card.getPower() === maxPower,
                    immediateEffect: abilityHelper.immediateEffects.giveExperience()
                }),
                onFalse: abilityHelper.immediateEffects.giveExperience({
                    target: friendlyUnits.find((x) => x.getPower() === maxPower)
                })
            };
        });
    }
}