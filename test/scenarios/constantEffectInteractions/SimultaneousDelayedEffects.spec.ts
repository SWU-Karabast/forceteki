// TODO add valid tests here
// describe('Zorii Bliss', function() {
//     integration(function(contextRef) {
//         describe('Zorii Bliss\'s ability', function() {
//             beforeEach(function () {
//                 contextRef.setupTest({
//                     phase: 'action',
//                     player1: {
//                         groundArena: ['zorii-bliss#valiant-smuggler'],
//                         hand: ['volunteer-soldier', 'change-of-heart'],
//                         deck: ['battlefield-marine', 'wampa']
//                     },
//                     player2: {
//                         hand: ['vanquish'],
//                         groundArena: ['pyke-sentinel']
//                     }
//                 });
//             });

//             it('player may choose order to resolve simultaneous delayed effects', function () {
//                 const { context } = contextRef;
//                 context.player1.clickCard(context.changeOfHeart);
//                 context.player1.clickCard(context.pykeSentinel);
//                 expect(context.pykeSentinel).toBeInZone('groundArena', context.player1);

//                 context.player2.passAction();
//                 context.player1.clickCard(context.zoriiBliss);
//                 expect(context.player1.hand.length).toBe(2);
//                 expect(context.battlefieldMarine).toBeInZone('hand', context.player1);

//                 context.moveToRegroupPhase();
//                 expect(context.player1).toHavePrompt('Choose a card to discard');
//                 expect(context.pykeSentinel).toBeInZone('groundArena', context.player2);
//                 context.player1.clickCard(context.volunteerSoldier);

//                 // Verify we move on to regroup phase
//                 expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
//                 context.player1.clickPrompt('Done');
//                 context.player2.clickPrompt('Done');

//                 // Pass again to make sure we don't have to discard again and that pyke sentinel remains home
//                 expect(context.player1).toBeActivePlayer();
//                 expect(context.pykeSentinel).toBeInZone('groundArena', context.player2);

//                 // Verify we move on to regroup phase again
//                 context.moveToRegroupPhase();
//                 expect(context.player2).toHavePrompt('Select between 0 and 1 cards to resource');
//             });

//             // TODO add more tests as needed - such as one where a delayed effect resolution may cancel out another
//         });
//     });
// });
