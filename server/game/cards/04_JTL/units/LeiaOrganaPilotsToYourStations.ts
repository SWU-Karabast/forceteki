import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class LeiaOrganaPilotsToYourStations extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7924461681',
            internalName: 'leia-organa#pilots-to-your-stations',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Attack with a ${TextHelper.Trait.Pilot} unit or a unit with a ${TextHelper.Trait.Pilot} on it. It gets +1/+0 and gains ${TextHelper.Restore(1)} for this attack.`,
            optional: true,
            initiateAttack: {
                attackerCondition: (card) => card.isUnit() && (card.hasSomeTrait(Trait.Pilot) || card.upgrades.some((upgrade) => upgrade.hasSomeTrait(Trait.Pilot))),
                attackerLastingEffects:
                [{
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
                },
                {
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 1 })
                }]
            }
        });
    }
}
