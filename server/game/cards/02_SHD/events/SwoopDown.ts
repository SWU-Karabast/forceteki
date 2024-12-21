import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { EffectName, KeywordName, ZoneName } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class SwoopDown extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4663781580',
            internalName: 'swoop-down',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Attack with a space unit. It gains Saboteur and can attack ground units for this attack. If it attacks a ground unit, it gets +2/+0 and the defender gets –2/–0 for this attack.',
            initiateAttack: {
                attackerCondition: (card) => card.zoneName === ZoneName.SpaceArena,
                attackerLastingEffects: [
                    { effect: OngoingEffectBuilder.card.static(EffectName.CanAttackGroundArenaFromSpaceArena) },
                    { effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur) },
                    {
                        condition: (attack) => attack.target.zoneName === ZoneName.GroundArena,
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                    },
                ],
                defenderLastingEffects: {
                    condition: (attack) => attack.target.zoneName === ZoneName.GroundArena,
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 }),
                }
            }
        });
    }
}

SwoopDown.implemented = true;
