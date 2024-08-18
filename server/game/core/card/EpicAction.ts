import AbilityHelper from '../../AbilityHelper';
import { IActionProps, IEpicActionProps } from '../../Interfaces';
import { CardActionAbility } from '../ability/CardActionAbility';
import Card from './Card';
import { CardConstructor } from './NewCard';

export function EpicAction<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithEpicAction extends BaseClass {
        public addEpicActionAbility(properties: IEpicActionProps<this>, cardImpl: Card): void {
            const propertiesWithLimit: IActionProps<this> = Object.assign(properties, {
                limit: AbilityHelper.limit.perGame(1),
            });

            // FIXME: null -> this
            this.actions.push(new CardActionAbility(this.game, cardImpl, propertiesWithLimit));
        }
    };
}