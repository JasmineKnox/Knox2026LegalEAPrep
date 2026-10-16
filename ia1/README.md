# IA1 Casefile — Mrs Knox Teaches

A buildless GitHub Pages game for Queensland senior Legal Studies, Unit 3 Topic 1: Governance in Australia.

## Student link

https://jasmineknox.github.io/Knox2026LegalEAPrep/ia1/

## Included

- 60 shuffled multiple-choice questions with explanatory feedback, topic filters, 10/20/all-question rounds and a missed-question queue.
- 22 written challenges: retrieve without notes, compare with a suggested model, self-check and repair a sentence or idea.
- Three accessible up/down ordering drills: Queensland legislative process, constitutional alteration and legal reasoning.
- Two clearly labelled fictional governance case files, each with six sources and eight written stages: nature and scope, viewpoints, evidence limits, alternatives, recommendation and implications.
- Browser-local knowledge records, saved writing drafts, saved case plans, downloadable text plans and printing.

## Use in class

A suggested 20-minute study lab: ten recall questions, one written challenge, then a check and repair. For a longer lesson, use a case file and turn the saved plan into a handwritten extended response. Ask students to explain why their evidence supports their conclusion.

The suggested practice times are study guidance, not official examination conditions. Follow the actual school task sheet. This resource is independent and is not endorsed by QCAA.

## Assessment alignment and boundaries

Based on QCAA Legal Studies General senior syllabus 2025 v1.3, Unit 3 Topic 1, and the IA1 comprehending, analysing and evaluating criteria. Knowledge selection also draws on the supplied classroom teaching sequence. The game does not reproduce the school’s unseen questions or stimulus, student names, assessment dates or school branding. Fictional rules and statistics are explicitly identified as invented. The questions rehearse concepts and transferable legal reasoning rather than predict the assessment.

Written answers are **self-assessed**, not automatically marked. Models are suggested responses; alternative defensible answers are possible. Checklists describe features to look for and do not translate to an official mark. Quiz records show latest correctness; written and case records show completion, not demonstrated mastery. Practice XP is awarded once per completed item and is not an exam score.

## Files and editing

`index.html`, `style.css`, `data.js` and `app.js` all live in this folder. No build, database, dependencies or API keys are required. Content is held in `BANK` in `data.js`; quiz answers use zero-based indexes. Options are shuffled at runtime. Add new items with unique IDs; maintain historical-case qualifications and source notes.

The existing repository homepage and EA game are untouched. This folder is served as a separate path by a root-based GitHub Pages deployment. If Pages uses a custom workflow rather than the repository root, include the `ia1` folder in that workflow’s deployed artifact.

## Sources

Source links appear in the game. Checked 16 October 2026:

- QCAA, Legal Studies 2025 v1.3 General senior syllabus: https://www.qcaa.qld.edu.au/downloads/senior-qce/syllabuses/snr_legal_25_syll.pdf
- Australian Constitution (Federal Register): https://www.legislation.gov.au/C2004Q00685/latest
- Queensland Parliament, Making a Law: https://www.parliament.qld.gov.au/documents/explore/education/factsheets/Factsheet_3.7_MakingOfALaw.pdf
- Parliamentary Education Office, separation of powers: https://peo.gov.au/understand-our-parliament/how-parliament-works/system-of-government/separation-of-powers-parliament-executive-and-judiciary
- PEO, double dissolution: https://peo.gov.au/understand-our-parliament/having-your-say/elections-and-voting/double-dissolution
- High Court, role: https://www.hcourt.gov.au/about/overview-high-court/role-high-court
- AIATSIS, Mabo: https://aiatsis.gov.au/ntpd-resource/742
- High Court, iiNet judgment summary: https://www.hcourt.gov.au/sites/default/files/assets/publications/judgment-summaries/2012/hcasum16_2012_04_20_iiNet.pdf
- Federal Court, Al Masri, judgment via Refworld: https://www.refworld.org/jurisprudence/caselaw/ausfc/2002/18813
- High Court, NZYQ: https://www.hcourt.gov.au/cases-and-judgments/judgments/judgments-1998-current/nzyq-v-minister-immigration-citizenship-and-multicultural-affairs
- QCAT: https://www.qcat.qld.gov.au/about-qcat
- Supreme Court of Tasmania, Tasmanian Dam Case context: https://www.supremecourt.tas.gov.au/publications/speeches-articles/tasmanian-cases-high-court-australia/

Legal wording is summarised, not quoted. No third-party artwork or official logos are copied. The interface uses the supplied Mrs Knox Teaches deep green/sage palette with restrained purple, blue and amber accents and an Arial fallback.

## Privacy and storage

The game uses only device-local browser storage and does not transmit names, answers, analytics or progress. It makes no external asset requests. External references open only when followed. Saved responses can be read by anyone using the same browser profile; clear progress on shared devices. Browser clearing or private browsing can remove progress. If storage is unavailable, play continues without reliable persistence.

## Validation

JavaScript syntax and content structure checked. Interaction/state tests cover quiz scoring and repeat-click protection, retry queues, saved writing, case progression, process checks and unavailable storage. Browser visual QA was unavailable in this environment; mobile layout and keyboard focus styles are implemented but require a real-device review.

Created by Mrs Knox
