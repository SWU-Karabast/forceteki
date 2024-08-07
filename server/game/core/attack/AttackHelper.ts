import AbilityDsl from '../../AbilityDsl';
import CardAbilityStep from '../ability/CardAbilityStep';
import { Location, CardType, EffectName, RelativePlayer } from '../Constants';
import { IInitiateAttack } from "../../Interfaces";

// TODO: these are not yet used, probably we'll need them for AbilityDsl at some point?

// export const initiateAttack = (game, card, properties) => {
//     if (properties.initiateAttack) {
//         if (card.type === CardType.Unit) {
//             initiateAttackFromUnit(game, card, properties);
//         } else {
//             initiateAttackFromOther(game, card, properties);
//         }
//     }
// }

// const checkAttackerCondition = (card, context, properties) => {
//     const attackerCondition = getProperty(properties, context, 'attackerCondition');

//     return attackerCondition ? attackerCondition(card, context) : true;
// }

// const initiateAttackFromUnit = (game, card, properties) => {
//     const prevCondition = properties.condition;
//     properties.condition = (context) => {
//         const abilityCondition = (!prevCondition || prevCondition(context));
//         const attackerCondition = checkAttackerCondition(card, context, properties);
//         return abilityCondition && attackerCondition;
//     }
//     properties.target = {
//         ...getBaselineAttackTargetProperties(card, properties),
//         gameSystem: AbilityDsl.actions.duel((context) => {
//             const attackProperties = getProperty(properties, context);
//             return Object.assign({ attacker: context.source }, attackProperties);
//         })
//     };
// }

// const initiateAttackFromOther = (game, card, properties) => {
//     properties.targets = {
//         attacker: {
//             cardType: CardType.Character,
//             player: (context) => {
//                 const opponentChoosesAttacker = getProperty(properties, context, 'opponentChoosesAttacker');
//                 return opponentChoosesAttacker ? RelativePlayer.Opponent : RelativePlayer.Self;
//             },
//             controller: RelativePlayer.Self,
//             cardCondition: (card, context) => checkAttackerCondition(card, context, properties)
//         },
//         duelTarget: {
//             dependsOn: 'attacker',
//             ...getBaselineAttackTargetProperties(undefined, properties),
//             gameSystem: AbilityDsl.actions.duel((context) => {
//                 const attackProperties = getProperty(properties, context);
//                 return Object.assign({ attacker: context.targets.attacker }, attackProperties);
//             })
//         }
//     };
// }

// const getBaselineAttackTargetProperties = (attacker, properties) => {
//     const props = {
//         cardType: CardType.Unit,
//         player: (context) => {
//             const opponentChoosesAttackTarget = getProperty(properties, context, 'opponentChoosesAttackTarget');
//             return opponentChoosesAttackTarget ? RelativePlayer.Opponent : RelativePlayer.Self;
//         },
//         controller: RelativePlayer.Opponent,
//         cardCondition: (card, context) => {
//             const attackerCard = attacker ?? context.targets.attacker;

//             if (attackerCard === card) {
//                 return false;
//             }
//             const targetCondition = getProperty(properties, context, 'targetCondition');
//             // default target condition
//             return targetCondition ? targetCondition(card, context) : null;
//         },        
//     };
//     return props;
// }

// const getProperty = (properties, context, propName?) => {
//     let attackProperties: IInitiateAttack;

//     if (typeof properties.initiateAttack === 'function') {
//         attackProperties = properties.initiateAttack(context);
//     } else {
//         attackProperties = properties.initiateAttack;
//     }

//     // default values
//     attackProperties = {
//         ...attackProperties
//     }

//     if (!propName) {
//         return attackProperties;
//     }

//     return attackProperties?.[propName];
// }