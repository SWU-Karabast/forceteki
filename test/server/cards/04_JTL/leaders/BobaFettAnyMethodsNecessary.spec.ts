
// describe('Boba Fett, Any Methods Necessary', function() {
//     integration(function(contextRef) {
//         describe('Boba Fett, Any Methods Necessary\'s undeployed ability', function() {
//             it('TBD', async function () {
//                 await contextRef.setupTestAsync({
//                     phase: 'action',
//                     player1: {
//                         spaceArena: [{ card: 'alliance-xwing', damage: 2 }],
//                         groundArena: [{ card: 'wampa', damage: 2 }, 'low-altitude-gunship'],
//                         leader: ''
//                     },
//                     player2: {
//                         hand: ['waylay'],
//                         groundArena: [{ card: 'atst', damage: 3 }, 'republic-tactical-officer'],
//                     }
//                 });

//                 const { context } = contextRef;

//                 // Attack with a Vehicle unit
//                 context.player1.clickCard(context.allianceXwing);
//                 context.player1.clickCard(context.p2Base);

//                 // Opponent attacked with a Vehicle unit
//                 context.player2.clickCard(context.atst);
//                 context.player2.clickCard(context.p1Base);

//                 // Heal the Vehicle unit
//                 context.player1.clickCard(context.roseTico);
//                 context.player1.clickPrompt('Heal 2 damage from a Vehicle unit that attacked this phase');
//                 expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.atst]); // Only the Vehicle units that attacked this phase
//                 expect(context.player1).not.toHavePassAbilityButton();
//                 context.player1.clickCard(context.atst);
//             });
//         });
//     });
// });