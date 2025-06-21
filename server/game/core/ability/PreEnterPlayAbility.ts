import type { IAbilityPropsWithSystems } from '../../Interfaces';
import type { Card } from '../card/Card';
import { AbilityType } from '../Constants';
import type Game from '../Game';
import type { AbilityContext } from './AbilityContext';
import { CardAbility } from './CardAbility';

export default class PreEnterPlayAbility extends CardAbility {
    public constructor(
        game: Game,
        card: Card,
        properties: IAbilityPropsWithSystems<AbilityContext<Card>>
    ) {
        super(game, card, properties, AbilityType.Triggered);

        if (!card.canRegisterPreEnterPlayAbilities()) {
            throw Error(`Card '${card.internalName}' cannot have pre-enter play abilities`);
        }
    }
}