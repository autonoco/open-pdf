import { type DocMeta, PageNumber, type PageOptions, TotalPages } from '@autono/open-pdf';
import type { ReactNode } from 'react';

// A legal document keeps this classic typesetting: never apply a theme to it.

export const meta: DocMeta = {
  title: 'Mutual NDA',
  createdAt: '2026-10-01T00:00:00.000Z',
};

const partyA = {
  name: 'Northwind Robotics, Inc.',
  short: 'Northwind',
  entity: 'a Delaware corporation',
};
const partyB = {
  name: 'Harbor Analytics LLC',
  short: 'Harbor',
  entity: 'a California limited liability company',
};
const purpose = 'a potential data partnership and related business relationship';
const term = 'two (2) years';
const survival = 'three (3) years';
const governingState = 'California';

// Tinos is metric-compatible with Times New Roman and openly licensed (Apache 2.0).
const tinos = 'https://fonts.gstatic.com/s/tinos/v26/';

// Sizes are typeset in points like a word-processed contract; 1pt = 4/3 CSS px.
const PT = 4 / 3;

export const pageOptions: PageOptions = {
  size: 'letter',
  margin: 72 * PT,
  fonts: [
    `${tinos}buE4poGnedXvwjX7fmE.ttf`,
    `${tinos}buE1poGnedXvwj1AW3Fu0Co.ttf`,
    `${tinos}buE2poGnedXvwjX-TmZJ8A.ttf`,
  ],
  footer: (
    <div
      tw="flex w-full justify-between text-[#555555]"
      style={{ fontFamily: 'Tinos', fontSize: 8.5 * PT, paddingBottom: 0.3 * 96 }}
    >
      <span>
        Mutual Non-Disclosure Agreement – {partyA.short} / {partyB.short} – Confidential
      </span>
      <span tw="flex">
        Page <PageNumber /> of <TotalPages />
      </span>
    </div>
  ),
};

const body = {
  fontSize: 10.5 * PT,
  lineHeight: `${14 * PT}px`,
  marginTop: 0,
  marginBottom: 7 * PT,
};

const Title = ({ children }: { children: ReactNode }) => (
  <h1
    tw="text-center font-bold"
    style={{ fontSize: 15 * PT, lineHeight: `${19 * PT}px`, marginTop: 0, marginBottom: 4 * PT }}
  >
    {children}
  </h1>
);

const Subtitle = ({ children }: { children: ReactNode }) => (
  <p
    tw="text-center text-[#333333]"
    style={{ fontSize: 10.5 * PT, lineHeight: `${13 * PT}px`, marginTop: 0, marginBottom: 16 * PT }}
  >
    {children}
  </p>
);

const Body = ({ children }: { children: ReactNode }) => (
  <p tw="text-justify" style={body}>
    {children}
  </p>
);

const Section = ({ children }: { children: ReactNode }) => (
  <p tw="text-justify" style={{ ...body, marginTop: 4 * PT }}>
    {children}
  </p>
);

const Sub = ({ children }: { children: ReactNode }) => (
  <p tw="text-justify" style={{ ...body, paddingLeft: 22 * PT }}>
    {children}
  </p>
);

const Centered = ({ children }: { children: ReactNode }) => (
  <p tw="text-center" style={{ ...body, marginTop: 6 * PT }}>
    {children}
  </p>
);

const Field = ({ label }: { label: string }) => (
  <div tw="flex items-end" style={{ paddingTop: 12 * PT }}>
    <span style={{ width: 0.55 * 72 * PT, paddingBottom: 2 * PT }}>{label}</span>
    <div
      tw="flex-1 border-b border-black"
      style={{ height: 16 * PT, borderBottomWidth: 0.6 * PT }}
    />
  </div>
);

const BlankLine = () => (
  <div tw="border-b border-black" style={{ height: 28 * PT, borderBottomWidth: 0.6 * PT }} />
);

const SignatureBlock = ({ company, descriptor }: { company: string; descriptor: string }) => (
  <div tw="flex flex-col" style={{ width: 3 * 72 * PT }}>
    <span tw="font-bold" style={{ lineHeight: `${14 * PT}px` }}>
      {company}
    </span>
    <span tw="italic" style={{ fontSize: 9.5 * PT, lineHeight: `${14 * PT}px` }}>
      {descriptor}
    </span>
    <div style={{ height: 18 * PT }} />
    <Field label="By:" />
    <Field label="Name:" />
    <Field label="Title:" />
    <Field label="Date:" />
    <div style={{ height: 6 * PT }} />
    <span tw="font-bold" style={{ paddingTop: 12 * PT, lineHeight: `${14 * PT}px` }}>
      Address for Notices:
    </span>
    <BlankLine />
    <BlankLine />
    <Field label="Email:" />
  </div>
);

export default function MutualNda() {
  return (
    <main tw="flex flex-col text-black" style={{ fontFamily: 'Tinos', fontSize: 10.5 * PT }}>
      <Title>MUTUAL NON-DISCLOSURE AGREEMENT</Title>
      <Subtitle>
        {partyA.name} and {partyB.name}
      </Subtitle>
      <Body>
        This Mutual Non-Disclosure Agreement (this “<b>Agreement</b>”) is entered into as of the
        date of the last signature set forth on the signature page below (the “<b>Effective Date</b>
        ”) by and between <b>{partyA.name}</b>, {partyA.entity} (“<b>{partyA.short}</b>”), and{' '}
        <b>{partyB.name}</b>, {partyB.entity} (“<b>{partyB.short}</b>”). {partyA.short} and{' '}
        {partyB.short} are each referred to as a “<b>Party</b>” and together as the “<b>Parties</b>
        .”
      </Body>
      <Body>
        The Parties wish to evaluate, discuss, and negotiate {purpose} between them (the “
        <b>Purpose</b>”). In connection with the Purpose, each Party may disclose Confidential
        Information (as defined below) to the other. In consideration of the mutual covenants in
        this Agreement, the Parties agree as follows:
      </Body>
      <Section>
        <b>1. Definitions.</b>
      </Section>
      <Sub>
        (a){'\u00a0'}
        {'\u00a0'}“<b>Confidential Information</b>” means any non-public information, in any form or
        medium (whether oral, written, electronic, visual, or otherwise), that is disclosed or made
        available by or on behalf of a Party (the “<b>Disclosing Party</b>”) to the other Party (the
        “<b>Receiving Party</b>”) on or after the Effective Date in connection with the Purpose, and
        that is marked or identified as confidential or that a reasonable person would understand to
        be confidential given the nature of the information and the circumstances of disclosure.
        Confidential Information includes, without limitation: datasets, data samples, data schemas,
        data dictionaries, and metadata; technical information, algorithms, models, source and
        object code, software, hardware and robotics designs, specifications, and know-how; product
        plans and roadmaps; business, financial, pricing, customer, supplier, and partner
        information; trade secrets; and the existence and terms of the Parties’ discussions
        regarding the Purpose. Confidential Information also includes all notes, analyses,
        compilations, and other materials prepared by the Receiving Party to the extent they contain
        or reflect Confidential Information.
      </Sub>
      <Sub>
        (b){'\u00a0'}
        {'\u00a0'}“<b>Representatives</b>” means a Party’s affiliates and its and their respective
        directors, officers, managers, members, employees, contractors, and professional advisors
        (including attorneys, accountants, and financial advisors) who have a need to know
        Confidential Information for the Purpose.
      </Sub>
      <Sub>
        (c){'\u00a0'}
        {'\u00a0'}“<b>Personal Information</b>” means any information that identifies, relates to,
        describes, is reasonably capable of being associated with, or could reasonably be linked,
        directly or indirectly, with a particular individual or household, and any information
        defined as “personal information,” “personal data,” or a similar term under applicable data
        protection laws.
      </Sub>
      <Section>
        <b>2. Exclusions.</b> Confidential Information does not include information that the
        Receiving Party can demonstrate by competent evidence: (a) is or becomes generally available
        to the public through no act or omission of the Receiving Party or its Representatives in
        breach of this Agreement; (b) was known to the Receiving Party, without restriction on use
        or disclosure, before receipt from the Disclosing Party; (c) is rightfully received by the
        Receiving Party from a third party that is not under an obligation of confidentiality with
        respect to such information; or (d) is independently developed by the Receiving Party
        without use of or reference to the Disclosing Party’s Confidential Information.
        Notwithstanding the foregoing, Personal Information remains subject to Section 5 regardless
        of whether any exclusion in this Section 2 applies.
      </Section>
      <Section>
        <b>3. Obligations of the Receiving Party.</b> The Receiving Party shall: (a) use the
        Disclosing Party’s Confidential Information solely for the Purpose; (b) not disclose
        Confidential Information to any person other than its Representatives who need to know it
        for the Purpose and who are bound by written obligations of confidentiality, or professional
        duties of confidentiality, at least as protective as those in this Agreement; (c) protect
        Confidential Information using at least the same degree of care it uses to protect its own
        confidential information of a similar nature, and in no event less than a reasonable degree
        of care; (d) not reverse engineer, decompile, or disassemble any software, models,
        prototypes, or other tangible items provided as Confidential Information; (e) not copy or
        reproduce Confidential Information except as reasonably necessary for the Purpose; and (f)
        promptly notify the Disclosing Party in writing upon becoming aware of any unauthorized
        access to, or use or disclosure of, Confidential Information, and reasonably cooperate to
        mitigate its effects. Each Party is responsible for any breach of this Agreement by its
        Representatives.
      </Section>
      <Section>
        <b>4. Compelled Disclosure.</b> If the Receiving Party or any of its Representatives is
        required by law, regulation, subpoena, court order, or other legal process to disclose any
        Confidential Information, the Receiving Party shall, to the extent legally permitted, give
        the Disclosing Party prompt written notice so that the Disclosing Party may seek a
        protective order or other appropriate remedy, and shall reasonably cooperate with such
        efforts at the Disclosing Party’s expense. The Receiving Party may disclose only that
        portion of the Confidential Information that it is legally required to disclose and shall
        use reasonable efforts to obtain assurance that confidential treatment will be accorded to
        it.
      </Section>
      <Section>
        <b>5. Data and Personal Information.</b> To the extent the Purpose involves the exchange of
        data, the Parties agree as follows:
      </Section>
      <Sub>
        (a){'\u00a0'}
        {'\u00a0'}Unless the Parties first agree otherwise in a signed writing, neither Party shall
        disclose Personal Information to the other under this Agreement, and each Party shall use
        reasonable efforts to provide only aggregated, de-identified, synthetic, or sample data for
        evaluation.
      </Sub>
      <Sub>
        (b){'\u00a0'}
        {'\u00a0'}If any Personal Information is disclosed or made available (whether intentionally
        or inadvertently), the Receiving Party shall (i) process it only as necessary for the
        Purpose and in compliance with all applicable data protection and privacy laws; (ii)
        implement reasonable administrative, technical, and physical security measures appropriate
        to the nature of the information; (iii) not sell or share such Personal Information (as
        those terms are defined under applicable law); and (iv) promptly notify the Disclosing Party
        of any inadvertent receipt and, at the Disclosing Party’s direction, return or securely
        delete it.
      </Sub>
      <Sub>
        (c){'\u00a0'}
        {'\u00a0'}The Receiving Party shall not attempt to re-identify any individual or household
        from any de-identified, pseudonymized, or aggregated data provided by the Disclosing Party,
        and shall not link or combine such data with other data for the purpose of identifying any
        individual.
      </Sub>
      <Sub>
        (d){'\u00a0'}
        {'\u00a0'}Any transfer or processing of Personal Information beyond evaluation of the
        Purpose, including in connection with any definitive agreement between the Parties, shall be
        governed by a separate written agreement (such as a data processing or data license
        agreement) executed by the Parties.
      </Sub>
      <Section>
        <b>6. Return or Destruction.</b> Upon the Disclosing Party’s written request, or upon
        expiration or termination of this Agreement, the Receiving Party shall promptly (and in any
        event within thirty (30) days) return or destroy all Confidential Information of the
        Disclosing Party in its or its Representatives’ possession or control and, upon request,
        certify such return or destruction in writing by an authorized officer. Notwithstanding the
        foregoing, the Receiving Party may retain copies of Confidential Information (a) to the
        extent required by applicable law, regulation, or bona fide internal document retention
        policies, or (b) in automatic electronic backup systems that are not readily accessible in
        the ordinary course of business, in each case provided that such retained Confidential
        Information remains subject to the confidentiality obligations of this Agreement for so long
        as it is retained.
      </Section>
      <Section>
        <b>7. No License; Ownership.</b> All Confidential Information remains the property of the
        Disclosing Party. Nothing in this Agreement grants the Receiving Party any license,
        ownership interest, or other right in or to any Confidential Information, data, patent,
        copyright, trade secret, trademark, or other intellectual property right of the Disclosing
        Party, except the limited right to use Confidential Information for the Purpose in
        accordance with this Agreement.
      </Section>
      <Section>
        <b>8. No Warranty.</b> ALL CONFIDENTIAL INFORMATION IS PROVIDED “AS IS.” NEITHER PARTY MAKES
        ANY REPRESENTATION OR WARRANTY, EXPRESS OR IMPLIED, AS TO THE ACCURACY, COMPLETENESS,
        PERFORMANCE, NON-INFRINGEMENT, OR FITNESS FOR A PARTICULAR PURPOSE OF ANY CONFIDENTIAL
        INFORMATION. Each Party represents that it has the right to disclose the Confidential
        Information it discloses under this Agreement.
      </Section>
      <Section>
        <b>9. No Obligation; Independent Development.</b> This Agreement does not obligate either
        Party to disclose any particular information, to continue discussions, or to enter into any
        further agreement or transaction. Any definitive agreement regarding the Purpose will be set
        forth only in a separate written agreement signed by both Parties. Subject to its compliance
        with this Agreement, nothing in this Agreement restricts either Party from independently
        developing, acquiring, or marketing products, services, or data that compete with those of
        the other Party, or from entering into discussions or agreements with third parties.
      </Section>
      <Section>
        <b>10. Term and Termination.</b> This Agreement shall commence on the Effective Date and
        continue for a term of {term}, unless earlier terminated by either Party upon thirty (30)
        days’ prior written notice to the other Party. The Receiving Party’s obligations under this
        Agreement with respect to Confidential Information disclosed during the term shall survive
        expiration or termination of this Agreement for a period of {survival} thereafter; provided,
        however, that (a) with respect to any Confidential Information that constitutes a trade
        secret under applicable law, such obligations shall survive for so long as such information
        remains a trade secret, and (b) the obligations in Section 5 shall survive for so long as
        the Receiving Party or its Representatives retain any Personal Information. Sections 5
        through 8 and 10 through 14 shall survive any expiration or termination of this Agreement.
      </Section>
      <Section>
        <b>11. Remedies.</b> Each Party acknowledges that unauthorized use or disclosure of the
        other Party’s Confidential Information may cause irreparable harm for which monetary damages
        would be an inadequate remedy. Accordingly, in addition to any other remedies available at
        law or in equity, the Disclosing Party shall be entitled to seek injunctive or other
        equitable relief to prevent or restrain any actual or threatened breach of this Agreement,
        without the necessity of proving actual damages and, to the extent permitted by law, without
        posting a bond or other security.
      </Section>
      <Section>
        <b>12. Defend Trade Secrets Act Notice.</b> Pursuant to 18 U.S.C. § 1833(b), an individual
        shall not be held criminally or civilly liable under any federal or state trade secret law
        for the disclosure of a trade secret that is made (a) in confidence to a federal, state, or
        local government official, either directly or indirectly, or to an attorney, solely for the
        purpose of reporting or investigating a suspected violation of law; or (b) in a complaint or
        other document filed in a lawsuit or other proceeding, if such filing is made under seal.
        Nothing in this Agreement prohibits any individual from reporting possible violations of law
        to any governmental agency or from making other disclosures protected under applicable
        whistleblower laws.
      </Section>
      <Section>
        <b>13. Governing Law; Venue.</b> This Agreement shall be governed by and construed in
        accordance with the laws of the State of {governingState}, without regard to its conflict of
        laws principles. Each Party irrevocably submits to the exclusive jurisdiction of the state
        and federal courts located in the State of {governingState} for any action arising out of or
        relating to this Agreement, and waives any objection to venue in such courts; provided that
        either Party may seek injunctive or other equitable relief in any court of competent
        jurisdiction. In any action to enforce this Agreement, the prevailing Party shall be
        entitled to recover its reasonable attorneys’ fees and costs.
      </Section>
      <Section>
        <b>14. General.</b>
      </Section>
      <Sub>
        (a){'\u00a0'}
        {'\u00a0'}
        <i>Entire Agreement; Amendment; Waiver.</i> This Agreement constitutes the entire agreement
        between the Parties regarding its subject matter and supersedes all prior or contemporaneous
        understandings regarding such subject matter. This Agreement may be amended only by a
        written instrument signed by authorized representatives of both Parties. No failure or delay
        in exercising any right under this Agreement shall operate as a waiver of that right.
      </Sub>
      <Sub>
        (b){'\u00a0'}
        {'\u00a0'}
        <i>Assignment.</i> Neither Party may assign or transfer this Agreement without the prior
        written consent of the other Party, except to a successor in connection with a merger,
        acquisition, or sale of all or substantially all of its assets or business to which this
        Agreement relates, provided the successor agrees in writing to be bound by this Agreement.
        Any attempted assignment in violation of this Section is void. This Agreement binds and
        benefits the Parties and their respective permitted successors and assigns.
      </Sub>
      <Sub>
        (c){'\u00a0'}
        {'\u00a0'}
        <i>Severability.</i> If any provision of this Agreement is held invalid or unenforceable, it
        shall be enforced to the maximum extent permissible and the remaining provisions shall
        continue in full force and effect.
      </Sub>
      <Sub>
        (d){'\u00a0'}
        {'\u00a0'}
        <i>Notices.</i> All notices under this Agreement shall be in writing and delivered by hand,
        by nationally recognized overnight courier, or by email with confirmation of transmission,
        to the addresses set forth on the signature page (or such other address as a Party
        designates by notice). Notices are effective upon receipt.
      </Sub>
      <Sub>
        (e){'\u00a0'}
        {'\u00a0'}
        <i>Relationship of the Parties.</i> The Parties are independent contractors. Nothing in this
        Agreement creates a partnership, joint venture, agency, or fiduciary relationship between
        the Parties.
      </Sub>
      <Sub>
        (f){'\u00a0'}
        {'\u00a0'}
        <i>Export.</i> Each Party shall comply with all applicable U.S. export control and sanctions
        laws with respect to any Confidential Information received under this Agreement.
      </Sub>
      <Sub>
        (g){'\u00a0'}
        {'\u00a0'}
        <i>Counterparts; Electronic Signatures.</i> This Agreement may be executed in counterparts,
        each of which is deemed an original and all of which together constitute one instrument.
        Signatures delivered by electronic means (including PDF and any electronic signature
        complying with the U.S. federal ESIGN Act or any applicable state law based on the Uniform
        Electronic Transactions Act) are deemed original signatures for all purposes.
      </Sub>
      <Centered>
        <i>[Signature page follows.]</i>
      </Centered>

      <div tw="flex flex-col" style={{ breakBefore: 'page' }}>
        <h2
          tw="text-center font-bold"
          style={{
            fontSize: 12 * PT,
            lineHeight: `${15 * PT}px`,
            marginTop: 0,
            marginBottom: 14 * PT,
          }}
        >
          SIGNATURE PAGE TO MUTUAL NON-DISCLOSURE AGREEMENT
        </h2>
        <Body>
          IN WITNESS WHEREOF, the Parties have caused this Mutual Non-Disclosure Agreement to be
          executed by their duly authorized representatives as of the dates set forth below.
        </Body>
        <div
          tw="flex justify-between"
          style={{ marginTop: 18 * PT - 7 * PT, breakInside: 'avoid' }}
        >
          <SignatureBlock company={partyA.name.toUpperCase()} descriptor={partyA.entity} />
          <SignatureBlock company={partyB.name.toUpperCase()} descriptor={partyB.entity} />
        </div>
      </div>
    </main>
  );
}
