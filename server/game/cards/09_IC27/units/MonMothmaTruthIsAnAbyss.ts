import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class MonMothmaTruthIsAnAbyss extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2478948732',
            internalName: 'mon-mothma#truth-is-an-abyss',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Attack with another unit, even if it's exhausted. For this attack, it gains ${TextHelper.Overwhelm} and can't attack bases`,
            optional: true,
            targetResolver: {
                activePromptTitle: `Attack with another unit, even if it's exhausted. It gains ${TextHelper.Overwhelm} and can't attack bases for this attack`,
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.attack({
                    targetCondition: (card) => !card.isBase(),
                    allowExhaustedAttacker: true,
                    attackerLastingEffects: {
                        effect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)
                    }
                })
            }
        });
    }
}