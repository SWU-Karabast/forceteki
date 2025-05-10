import { DefeatSourceType, type IDefeatSource } from '../../IDamageOrDefeatSource';
import type { Card } from '../card/Card';
import { EventName } from '../Constants';
import * as Contract from '../utils/Contract';

export function defeatSourceCard(event): Card | undefined {
    if (!event) {
        return undefined;
    }

    Contract.assertTrue(event.name === EventName.OnCardDefeated);

    const defeatSource: IDefeatSource = event.defeatSource;
    if (defeatSource.type === DefeatSourceType.Attack) {
        return defeatSource.attack.attacker;
    } else if (defeatSource.type === DefeatSourceType.NonCombatDamage || defeatSource.type === DefeatSourceType.Ability) {
        return defeatSource.card;
    }

    return undefined;
}