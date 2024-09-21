import AbilityHelper from '../../AbilityHelper';
import TriggeredAbility from '../../core/ability/TriggeredAbility';
import { Card } from '../../core/card/Card';
import { KeywordName } from '../../core/Constants';
import Game from '../../core/Game';
import Contract from '../../core/utils/Contract';
import { ITriggeredAbilityProps } from '../../Interfaces';

/** @deprecated this is still WIP until attack changes are done */
// export class AmbushAbility extends TriggeredAbility {
//     public override readonly keyword: KeywordName | null = KeywordName.Ambush;

//     public static buildAmbushAbilityProperties(): ITriggeredAbilityProps {
//         return {
//             title: 'Ambush',
//             optional: true,
//             when: { onUnitEntersPlay: (event, context) => event.card === context.source },
//             immediateEffect: [
//                 AbilityHelper.immediateEffects.ready(),
//                 AbilityHelper.immediateEffects.attack((context) => {
//                     return { attacker: context.source };
//                 })
//             ]
//         };
//     }

//     public constructor(game: Game, card: Card) {
//         if (!Contract.assertTrue(card.isUnit())) {
//             return;
//         }

//         const properties = AmbushAbility.buildAmbushAbilityProperties();

//         super(game, card, properties);
//     }
// }