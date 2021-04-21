const config = require('../config.js');
const {waitForFinishedBusinessProcess, updateCaseData} = require('../api/testingSupport');
const {dateTime} = require('../api/dataHelper');

const getCaseId = caseNumber => `${caseNumber.split('-').join('').replace(/#/, '')}`;

Feature('RPA handoff points tests @rpa-handoff-tests');

Scenario('Take claim offline', async (I) => {
  await I.login(config.applicantSolicitorUser);
  await I.createCase();
  const caseNumber = await I.grabCaseNumber();
  await I.notifyClaim();
  await I.notifyClaimDetails();
  await I.acknowledgeClaim('fullDefence');

  await I.navigateToCaseDetailsAs(config.adminUser, caseNumber);
  await I.caseProceedsInCaseman();
  await I.assertNoEventsAvailable();
  await I.signOut();
});

Scenario('Defendant - Litigant In Person', async (I) => {
  await I.login(config.solicitorUser);
  await I.createCase(true);
  await I.assertNoEventsAvailable();
});

Scenario('Defendant - Defend part of Claim', async (I) => {
  await I.createCase();
  await I.notifyClaim();
  await I.notifyClaimDetails();
  await I.acknowledgeClaim('partDefence');
  await I.respondToClaim('partAdmission');
});

Scenario('Defendant - Defends, Claimant decides not to proceed', async (I) => {
  await I.createCase();
  await I.notifyClaim();
  await I.notifyClaimDetails();
  await I.acknowledgeClaim('fullDefence');
  await I.respondToClaim('fullDefence');
  await I.respondToDefenceDropClaim();
  await I.assertNoEventsAvailable();
});

Scenario('Defendant - Defends, Claimant decides to proceed', async (I) => {
  await I.createCase();
  await I.notifyClaim();
  await I.notifyClaimDetails();
  await I.acknowledgeClaim('fullDefence');
  await I.respondToClaim('fullDefence');
  await I.respondToDefence();
  await I.assertNoEventsAvailable();
});

Scenario('Claimant does not respond to defence with defined timescale', async (I) => {
  await I.createCase();
  const caseNumber = await I.grabCaseNumber();
  const caseId = getCaseId(caseNumber);
  await I.notifyClaim();
  await I.notifyClaimDetails();
  await I.acknowledgeClaim('partDefence');
  await I.respondToClaim('fullDefence');

  await waitForFinishedBusinessProcess(caseId);
  await updateCaseData(caseId, {claimDismissedDeadline: dateTime(-1)});

  console.log('Start waiting for Case dismissed scheduler ' + dateTime());
  // Sleep waiting for Case dismissed scheduler
  await sleep(600);
  console.log('Waiting finished ' + dateTime());
  await I.navigateToCaseDetails(caseNumber);
  await I.assertNoEventsAvailable();
});

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
