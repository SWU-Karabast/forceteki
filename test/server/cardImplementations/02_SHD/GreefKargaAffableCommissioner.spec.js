// describe('Greef Karga, Affable Commissioner', function() {
//     integration(function() {
//         describe('Greef Karga\'s Ability', function() {
//             beforeEach(function () {
//                 this.setupTest({
//                     phase: 'action',
//                     player1: {
//                         hand: ['greef-karga#affable-commissioner'],
//                         deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine']
//                     }
//                 });

//                 this.greefKarga = this.player1.findCardByName('greef-karga#affable-commissioner');
//                 this.foundling = this.player1.findCardByName('foundling');

//                 this.noMoreActions();
//             });

//             it('can draw upgrade', function () {
//                 this.player1.clickCard(this.greefKarga);
//                 expect(this.player1).toHavePrompt('Select a card to reveal');
//                 expect(this.player1).toHavePrompt('Foundling');
//                 expect(this.player1).toHaveDisabledPromptButton('atst');
//                 expect(this.player1).toHaveDisabledPromptButton('pyke-sentinel');
//                 expect(this.player1).toHaveDisabledPromptButton('cartel-spacer');
//                 expect(this.player1).toHaveDisabledPromptButton('battlefield-marine');
//                 this.player1.clickCard(this.foundling);
//                 expect(this.foundling.location).toBe('hand');
//                 expect(this.getChatLogs(2)).toContain('player1 takes Foundling');
//             });
//         });
//     });
// });
